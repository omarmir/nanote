<template>
  <UModal
    :ui="{ content: 'max-w-2xl' }"
    v-model:open="open"
    :close="{ onClick: () => emit('close', false) }"
    :aria-describedby="t('share')"
    :title="t('share')">
    <template #default>
      <slot name="trigger" />
    </template>
    <template #body>
      <i18n-t keypath="shareNote" tag="h3" v-if="note" class="mb-2">
        <template v-slot:note>
          <span class="text-primary">{{ note.label }}</span>
        </template>
      </i18n-t>
      <UForm :state="state" class="w-full" @submit="onSubmit" v-if="!shareLink">
        <UFormField :label="t('shareName')" name="name" class="w-full">
          <div class="flex w-full flex-row items-center gap-2">
            <UInput v-model="state.name" class="w-full" :placeholder="t('shareName')" />
            <UButton type="submit">
              {{ t('share') }}
            </UButton>
          </div>
        </UFormField>
        <UAlert
          v-if="shareError"
          color="error"
          variant="outline"
          icon="i-lucide-circle-alert"
          :title="t('failure')"
          :description="shareError"
          as="div"
          class="mt-2" />
      </UForm>
      <UAlert class="mt-4" v-if="shareLink" color="info" variant="subtle" :title="t('shareURL')" orientation="vertical">
        <template #description>
          <div class="text-wrap">
            {{ shareLink }}
          </div>
        </template>
        <template #actions>
          <UButton color="primary" variant="soft" @click="copyLink">
            <template #leading>
              <UIcon v-if="isCopied === null" name="i-lucide-copy"></UIcon>
              <UIcon v-if="isCopied" name="i-lucide-circle-check" class="text-success"></UIcon>
              <UIcon v-if="isCopied === false" name="i-lucide-circle-x" class="text-error"></UIcon>
            </template>
            {{ t('copy') }}
          </UButton>
        </template>
      </UAlert>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import { FetchError } from 'ofetch'
import { useClipboard } from '@vueuse/core'
const { copy, copied, isSupported } = useClipboard()

const { note } = defineProps<{ note: NotebookTreeItemClient }>()
const { t } = useI18n()

const emit = defineEmits<{ close: [boolean] }>()

const shareError: Ref<null | string> = ref(null)

const open = ref(false)

const state = reactive({
  name: ''
})

const shareLink: Ref<string | null> = ref(null)

async function onSubmit(event: FormSubmitEvent<NewNotebook>) {
  try {
    const shareResp = await $fetch<Result<string>>(`/api/share/${note.apiPath}`, {
      method: 'POST'
    })
    if (!shareResp.success) {
      shareError.value = shareResp.message
      return
    }
    shareError.value = null
    shareLink.value = `${window.location.origin}/share/${shareResp.data}`
  } catch (err) {
    shareError.value = (err as FetchError).data.message
  }
}

const isCopied: Ref<boolean | null> = ref(null)

const copyLink = async () => {
  if (!shareLink.value) return
  try {
    await copy(shareLink.value)
    isCopied.value = copied.value
  } catch (err) {
    isCopied.value = false
  } finally {
    setTimeout(() => {
      isCopied.value = null
    }, 5000)
  }
}
</script>
