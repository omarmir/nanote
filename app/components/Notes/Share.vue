<template>
  <UModal
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
      <UForm :state="state" class="w-full" @submit="onSubmit">
        <UFormField :label="t('shareName')" name="name" class="w-full">
          <div class="flex w-full flex-row items-center gap-2">
            <UInput v-model="state.name" class="w-full" :placeholder="t('shareName')" />
            <UButton type="submit">
              {{ t('share') }}
            </UButton>
          </div>
        </UFormField>
        <UAlert
          class="mt-4"
          v-if="shareKey"
          color="info"
          variant="subtle"
          :title="t('URL')"
          :description="shareKey"></UAlert>
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
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import { FetchError } from 'ofetch'

const { note } = defineProps<{ note: NotebookTreeItemClient }>()
const { t } = useI18n()

const emit = defineEmits<{ close: [boolean] }>()

const shareError: Ref<null | string> = ref(null)

const open = ref(false)

const state = reactive({
  name: ''
})

const shareKey: Ref<string | null> = ref(null)

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
    shareKey.value = shareResp.data
  } catch (err) {
    shareError.value = (err as FetchError).data.message
  }
}
</script>
