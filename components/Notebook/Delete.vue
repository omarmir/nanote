<template>
  <div class="flex flex-row items-center">
    <button class="text-red-500 hover:text-red-700" @click="deleteDialog = true">
      <Icon name="lucide:trash-2" class="size-6" />
    </button>
    <CommonBaseDialog
      v-model="deleteDialog"
      theme="danger"
      title="Delete Notebook"
      desc="This will delete all notes in the notebook and cannot be undone. Are you sure you want to delete this notebook?">
      <div class="flex flex-row flex-wrap justify-end gap-4">
        <CommonThemeButton
          :show-loading="true"
          :is-loading="deletingState"
          class="py-2"
          theme="danger"
          @click="deleteNotebook()">
          Delete
        </CommonThemeButton>
        <CommonThemeButton class="py-2" @click="deleteDialog = false">Cancel</CommonThemeButton>
        <CommonDangerAlert v-if="error" class="mb-4 w-full">{{ error }}</CommonDangerAlert>
      </div>
    </CommonBaseDialog>
  </div>
</template>
<script lang="ts" setup>
import { useNotebookStore } from '~/stores/notebooks'
import type { Notebook } from '~/types/notebook'

const store = useNotebookStore()

const { notebook } = defineProps<{ notebook: Notebook }>()

const deleteDialog = ref(false)
const deletingState = ref(false)
const error: Ref<string | null> = ref(null)

const deleteNotebook = async () => {
  deletingState.value = true
  const resp = await store.deleteNotebook(notebook)
  if (resp.success) {
    error.value = null
    deleteDialog.value = false
  } else {
    error.value = resp.message
  }
  deletingState.value = false
}
</script>
