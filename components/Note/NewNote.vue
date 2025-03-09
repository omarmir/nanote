<template>
  <form class="w-full grow" @submit.prevent="addItem">
    <label for="search" class="sr-only mb-2 text-sm font-medium text-gray-900">Note</label>
    <div class="relative mr-4 max-w-lg">
      <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-gray-400" viewBox="0 0 24 24">
          <path fill="currentColor" d="M4 22V2h10l6 6v14zm9-13V4H6v16h12V9zM6 4v5zv16z" />
        </svg>
      </div>
      <CommonToggleInput v-model="newItem" v-model:toggle="isNotebook" placeholder="Name" title="Notebook?">
        <template #label>
          <IconsNotebook class="size-5 text-accent"></IconsNotebook>
          <span class="hidden">Notebook?</span>
        </template>
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z" />
          </svg>
        </template>
      </CommonToggleInput>
    </div>
    <CommonDangerAlert v-if="error" class="mb-0 mr-4 mt-2">{{ error }}</CommonDangerAlert>
  </form>
</template>
<script lang="ts" setup>
import { IconsNotebook } from '#components'
import type { Notebook } from '~/types/notebook'
const { notebook } = defineProps<{ notebook: Notebook }>()

const noteBookStore = useNotebookStore()

const newItem: Ref<string | null> = ref('')
const isNotebook: Ref<boolean> = ref(false)
const error: Ref<string | null> = ref(null)

const addItem = async () => {
  if (!newItem.value) {
    error.value = 'Name is required.'
    return
  }

  const resp = isNotebook.value
    ? await noteBookStore.addNotebook(notebook, newItem.value)
    : await noteBookStore.addNote(notebook, newItem.value)

  if (resp.success) {
    newItem.value = null
    error.value = null
  } else {
    error.value = resp.message
  }
}
</script>
