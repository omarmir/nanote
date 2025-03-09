<template>
  <div class="flex flex-row items-center">
    <button class="text-red-500 hover:text-red-700" @click="deleteDialog = true">
      <svg xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2zM7 6v13z" />
      </svg>
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
