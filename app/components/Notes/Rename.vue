<template>
  <UModal
    v-model:open="open"
    :close="{ onClick: () => emit('close', false) }"
    :ui="{ description: 'hidden' }"
    :description="t('renameItem', { item: originalName })"
    :title="t('rename')">
    <template #default>
      <slot name="trigger" />
    </template>
    <template #body>
      <i18n-t v-if="originalName" keypath="renameItem" tag="h3" class="mb-2">
        <template #item>
          <span class="text-primary">{{ originalName }}</span>
        </template>
      </i18n-t>
      <UForm :schema="NewFileSchema" :state="state" class="w-full" @submit="onSubmit">
        <UFormField :label="t('newName')" name="name" class="w-full">
          <div class="flex w-full flex-col items-start gap-4">
            <UInput v-model="state.name" class="w-full" :placeholder="t('renameItem', { item: originalName })" />
            <USwitch v-model="state.isManual" :label="t('manual')" :aria-details="t('manualAddNewNote')" />
            <div class="flex w-full flex-row place-content-end items-center gap-4">
              <UButton type="submit" color="warning" :disabled="isRenaming">
                {{ t('rename') }}
                <template #leading>
                  <UIcon v-if="isRenaming" name="i-lucide-loader-circle" class="animate-spin" />
                  <UIcon v-else name="i-custom-gg-rename" />
                </template>
              </UButton>
              <UButton color="neutral" @click="cancelRename">
                {{ t('cancel') }}
              </UButton>
            </div>
          </div>
        </UFormField>
        <UAlert
          v-if="renameError"
          color="error"
          variant="outline"
          icon="i-lucide-circle-alert"
          :title="t('failure')"
          :description="renameError"
          as="div"
          class="mt-2" />
      </UForm>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'

const { originalName, originalPathArray, originalAPIPath, isMarkdown } = defineProps<{
  originalName: string
  originalPathArray: string[]
  originalAPIPath: string
  isMarkdown: boolean
}>()
const { t } = useI18n()

const open = ref(false)
const emit = defineEmits<{ close: [string | boolean] }>()

const toast = useToast()
const notebookStore = useNotebookStore()
const isRenaming = ref(false)

const renameError: Ref<null | string> = ref(null)

const state = reactive({
  name: originalName,
  isManual: !isMarkdown
})

async function onSubmit(event: FormSubmitEvent<NewName>) {
  isRenaming.value = true
  const renamedResp = await notebookStore.renameNote(originalAPIPath, event.data.name, originalName, originalPathArray)
  if (renamedResp.success) {
    toast.add({
      title: t('success'),
      description: t('renamedItem', { item: originalName, newName: renamedResp.data.label }),
      color: 'success'
    })
    renameError.value = null
    open.value = false
    emit('close', renamedResp.data.apiPath)
  } else {
    renameError.value = renamedResp.message
    toast.add({ title: t('failure'), description: renamedResp.message, color: 'error' })
  }
  isRenaming.value = false
}

const cancelRename = async () => emit('close', false)
</script>
