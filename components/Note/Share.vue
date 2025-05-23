<template>
  <button
    class="flex flex-row items-center gap-2 text-gray-900 hover:text-accent-hover dark:text-gray-400 dark:hover:text-accent"
    @click="shareDialog = true">
    <Icon class="size-6" name="lucide:share-2" />
    Share
  </button>
  <CommonBaseDialog
    v-model="shareDialog"
    theme="primary"
    title="Share Note"
    desc="Generate a sharable link. Note that they will only be able to view the note only.">
    <div class="flex flex-col gap-4">
      <div>
        <label for="share-name" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
          Share name (optional)
        </label>
        <CommonBaseInput v-model="name" class="!pe-2.5 !ps-2.5"></CommonBaseInput>
      </div>
      <CommonThemeButton
        :is-loading="isGeneratingShareLink"
        class="self-end py-2"
        theme="info"
        @click="generateShareCode()">
        Generate
      </CommonThemeButton>
      <div v-if="shareLink" class="flex flex-row items-center gap-4">
        <div class="min-w-0 flex-1 break-all bg-gray-200 p-2 font-mono dark:bg-gray-500 dark:text-gray-200">
          {{ shareLink }}
        </div>
        <CommonCopyButton v-model="shareLink"></CommonCopyButton>
      </div>
      <CommonDangerAlert v-if="shareError" class="w-full">{{ shareError }}</CommonDangerAlert>
    </div>
  </CommonBaseDialog>
</template>
<script setup lang="ts">
import type { Result } from '~/types/result'
import type { FetchError } from 'ofetch'

const { notebookAPIPath } = defineProps<{ notebookAPIPath: string }>()
const shareDialog = ref(false)
const shareLink: Ref<string | null> = ref(null)
const shareError: Ref<string | null> = ref(null)
const name: Ref<string | null> = ref(null)
const isGeneratingShareLink: Ref<boolean> = ref(false)

const generateShareCode = async () => {
  try {
    const sharedKey = await $fetch<Result<string>>(`/api/share/${notebookAPIPath}`, {
      method: 'POST',
      body: { name: name.value }
    })
    if (!sharedKey.success) {
      shareError.value = sharedKey.message
      return
    } else {
      shareLink.value = `${window.location.origin}/share/${sharedKey.data}`
    }
  } catch (err) {
    console.log(err)
    shareError.value = (err as FetchError).data.message
  }
}
</script>
