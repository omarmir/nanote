<template>
  <div class="flex flex-row items-center">
    <button class="text-red-500 hover:text-red-700" @click="deleteDialog = true">
      <Icon name="lucide:file-x" class="size-5" />
    </button>
    <CommonBaseDialog
      v-model="deleteDialog"
      theme="danger"
      title="Delete Note"
      desc="This will delete the note and cannot be undone. Are you sure you want to delete this note?">
      <template #desc>
        This will delete
        <span class="font-bold text-red-500">{{ note.name }}</span>
        and cannot be undone. Are you sure you want to delete this note?
      </template>
      <div class="flex flex-row flex-wrap justify-end gap-4">
        <CommonThemeButton :show-loading="true" :is-loading="deletingState" theme="danger" @click="deleteNote()">
          Delete
        </CommonThemeButton>
        <CommonThemeButton @click="deleteDialog = false">Cancel</CommonThemeButton>
        <CommonDangerAlert v-if="error" class="mb-4 w-full">{{ error }}</CommonDangerAlert>
      </div>
    </CommonBaseDialog>
  </div>
</template>
<script lang="ts" setup>
import { useNotebookStore } from '~/stores/notebooks'
import type { Note } from '~/types/notebook'

const store = useNotebookStore()

const { note } = defineProps<{ note: Note }>()

const deleteDialog = ref(false)
const deletingState = ref(false)
const error: Ref<string | null> = ref(null)

const deleteNote = async () => {
  deletingState.value = true
  const resp = await store.deleteNote(note.notebook, note.name)
  if (resp.success) {
    error.value = null
    deleteDialog.value = true
  } else {
    error.value = resp.message
  }
  deletingState.value = true
}
</script>
