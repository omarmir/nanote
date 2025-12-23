<template>
  <ul role="list" class="divide-default divide-y">
    <li v-for="note in notes" :key="note.id" class="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <div class="flex min-w-0 items-center gap-3">
        <div class="min-w-0 text-sm">
          <p class="text-highlighted truncate font-medium">
            {{ note.name }}
          </p>
          <p class="text-muted truncate">
            {{ note.path }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <UButton
          v-if="isSupported"
          size="sm"
          :label="t('copy')"
          @click="copyLink(note.key)"
          color="primary"
          variant="soft">
          <template #leading>
            <CommonStatusIcon :state="isCopied" icon="i-lucide-copy" />
          </template>
        </UButton>
        <UButton
          v-if="isSupported"
          size="sm"
          :label="t('delete')"
          @click="deletedShared(note.key)"
          color="primary"
          variant="soft">
          <template #leading>
            <CommonStatusIcon
              :state="isCopied"
              :icon="{ idle: 'i-lucide-copy', success: 'i-lucide-circle-check', error: 'i-lucide-circle-x' }" />
          </template>
        </UButton>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { SelectShared } from '~~/server/db/schema'
import { useClipboard } from '@vueuse/core'

const { copy, copied, isSupported } = useClipboard()
const { t } = useI18n()

const {
  data: notes,
  status,
  error
} = await useFetch<SelectShared[]>('/api/settings/shared', { method: 'GET', immediate: true })
const origin = window.location.origin

const isDeleted: Ref<ActionStatus> = ref('idle')
const deletedShared = (key: string) => {
  isDeleted.value = ''
  // data.value = data.value?.filter((sharedNote) => sharedNote.key !== key) ?? []
}

const isCopied: Ref<ActionStatus> = ref('idle')
const copyLink = async (shareKey: string) => {
  const shareLink = `${window.location.origin}/share/${shareKey}`
  if (!shareLink) return
  try {
    await copy(shareLink)
    isCopied.value = 'success'
  } catch (err) {
    console.error(err)
    isCopied.value = 'error'
  } finally {
    setTimeout(() => {
      isCopied.value = 'idle'
    }, 5000)
  }
}
</script>
