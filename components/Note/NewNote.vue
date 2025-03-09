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
          <IconsAdd></IconsAdd>
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
    ? await noteBookStore.addNotebook(newItem.value, notebook)
    : await noteBookStore.addNote(notebook, newItem.value)

  if (resp.success) {
    newItem.value = null
    isNotebook.value = false
    error.value = null
  } else {
    error.value = resp.message
  }
}
</script>
