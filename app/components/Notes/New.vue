<template>
  <UModal v-model:open="open" :close="{ onClick: () => emit('close', false) }" :title="t('newNote')">
    <template #default>
      <slot name="trigger" />
    </template>
    <template #body>
      <div class="flex flex-row place-content-end pb-2">
        <USwitch v-model="state.isManual" :label="t('manual')" :aria-details="t('manualAddNewNote')" />
      </div>
      <i18n-t :keypath="state.isManual ? 'manualAddNewNote' : 'addNote'" tag="h3" v-if="notebook" class="mb-2">
        <template v-slot:notebook>
          <span class="text-warning">{{ notebook.label }}</span>
        </template>
      </i18n-t>
      <UForm :schema="NewFileSchema" :state="state" class="w-full" :validate-on="['change']" @submit="onSubmit">
        <UFormField :label="t('noteName')" name="name" class="w-full">
          <div class="flex w-full flex-row items-center gap-2">
            <UInput v-model="state.name" class="w-full" :placeholder="t('noteName')" />
            <UButton type="submit" :icon="state.isManual ? 'i-lucide-file' : 'i-custom-ri-markdown-line'">
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

const { notebook } = defineProps<{ notebook: NotebookTreeItemClient }>()
const { t } = useI18n()

const emit = defineEmits<{ close: [boolean] }>()

const addError: Ref<null | string> = ref(null)

const open = ref(false)

const state = reactive({
  name: '',
  isManual: false
})

const notebookStore = useNotebookStore()

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<NewNote>) {
  const addResp = await notebookStore.addNote(event.data, notebook)
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
