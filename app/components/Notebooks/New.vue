<template>
  <UModal v-model:open="open" :close="{ onClick: () => emit('close', false) }" :title="t('newNotebook')">
    <template #default>
      <slot name="trigger" />
    </template>
    <template #body>
      <i18n-t keypath="addNotebook" tag="h3" v-if="notebook" class="mb-2">
        <template v-slot:notebook>
          <span class="text-primary">{{ notebook.label }}</span>
        </template>
      </i18n-t>
      <UForm :schema="NewFileFolderSchema" :state="state" class="w-full" @submit="onSubmit">
        <UFormField :label="t('notebookName')" name="name" class="w-full">
          <div class="flex w-full flex-row items-center gap-2">
            <UInput v-model="state.name" class="w-full" :placeholder="t('notebookName')" />
            <UButton type="submit">
              {{ t('create') }}
            </UButton>
          </div>
        </UFormField>
        <UAlert
          v-if="addError"
          color="error"
          variant="outline"
          icon="i-lucide-circle-alert"
          :title="t('failure')"
          :description="addError"
          as="div"
          class="mt-2" />
      </UForm>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'

const { notebook } = defineProps<{ notebook?: NotebookTreeItemClient }>()
const { t } = useI18n()

const emit = defineEmits<{ close: [boolean] }>()

const addError: Ref<null | string> = ref(null)

const open = ref(false)

const state = reactive({
  name: ''
})

const notebookStore = useNotebookStore()

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<NewNotebook>) {
  const addResp = await notebookStore.addNotebook(event.data.name, notebook)
  if (addResp.success) {
    toast.add({ title: t('success'), description: t('notebookCreatedSuccess'), color: 'success' })
    addError.value = null
    open.value = false
    emit('close', true)
  } else {
    addError.value = addResp.message
    toast.add({ title: t('failure'), description: addResp.message, color: 'error' })
  }
}
</script>
