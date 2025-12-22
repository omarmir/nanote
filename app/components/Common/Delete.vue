<template>
  <UModal
    v-model:open="open"
    :title="t('delete')"
    :close="{ onClick: () => emit('close', false) }"
    :aria-describedby="t('delete')">
    <template #default>
      <slot name="trigger" />
    </template>
    <template #body>
      <i18n-t :keypath="item.isNote ? 'deleteNote' : 'deleteNotebook'" tag="h3" class="mb-4">
        <template #item>
          <span class="text-primary">{{ item.label }}</span>
        </template>
      </i18n-t>
      <div class="flex flex-row place-content-end items-center gap-4">
        <UButton color="error" :disabled="isDeleting" @click="deleteItem">
          <template #leading>
            <UIcon v-if="isDeleting" name="i-lucide-loader-circle" class="animate-spin" />
          </template>
          {{ t('delete') }}
        </UButton>
        <UButton color="neutral" @click="cancelDeletion">
          {{ t('cancel') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const { item } = defineProps<{ item: NotebookTreeItem }>()
const { t } = useI18n()

const open = ref(false)
const emit = defineEmits<{ close: [boolean] }>()

const toast = useToast()
const notebookStore = useNotebookStore()
const isDeleting = ref(false)

const deleteError: Ref<null | string> = ref(null)

const deleteItem = async () => {
  isDeleting.value = true
  const deleteResp = item.isNote ? await notebookStore.deleteNote(item) : await notebookStore.deleteNotebook(item)
  if (deleteResp.success) {
    toast.add({ title: t('success'), description: t('deleted', { item: item.label }), color: 'success' })
    deleteError.value = null
    open.value = false
    emit('close', true)
  } else {
    deleteError.value = deleteResp.message
    toast.add({ title: t('failure'), description: deleteResp.message, color: 'error' })
  }
  isDeleting.value = false
}

const cancelDeletion = async () => emit('close', false)
</script>
