<template>
  <ul class="list-style-none">
    <li v-if="status === 'pending'" class="animate-pulse cursor-pointer select-none rounded-xl px-4 py-3">
      <div class="mb-2.5 h-2 w-4/5 rounded-full bg-gray-400/30"></div>
    </li>
    <li
      v-for="notebook in data?.notebooks"
      :key="notebook.name"
      class="items-center px-4 py-3"
      :class="{ 'bg-cyan-300/5': notebook.name === notebookStore.sidebarNotebookPath[0] }">
      <button
        type="button"
        class="text-muted flex flex-grow flex-row items-center gap-2 overflow-x-clip text-left text-base font-medium text-gray-400 hover:text-white"
        @click="openNotebook(notebook)">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 1024 1024">
          <path
            fill="currentColor"
            d="M192 128v768h640V128zm-32-64h704a32 32 0 0 1 32 32v832a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32" />
          <path
            fill="currentColor"
            d="M672 128h64v768h-64zM96 192h128q32 0 32 32t-32 32H96q-32 0-32-32t32-32m0 192h128q32 0 32 32t-32 32H96q-32 0-32-32t32-32m0 192h128q32 0 32 32t-32 32H96q-32 0-32-32t32-32m0 192h128q32 0 32 32t-32 32H96q-32 0-32-32t32-32" />
        </svg>
        <div class="w-[230px] truncate text-sm lg:w-[220px]">
          {{ notebook.name }}
        </div>
      </button>
      <div class="lg:hidden">
        <NotebookContents
          type="sidebar"
          :on-background="true"
          :notebook="notebook"
          :show-children="true"></NotebookContents>
        <CommonDangerAlert v-if="error" class="mb-4 mt-4">{{ error.data.message }}</CommonDangerAlert>
      </div>
    </li>
  </ul>
</template>
<script lang="ts" setup>
import { useNotebookStore } from '~/stores/notebooks'
import type { Notebook, NotebookContents } from '~/types/notebook'
const { data, status, error } = useFetch<NotebookContents>('/api/notebook', {
  immediate: true,
  lazy: false
})

const notebookStore = useNotebookStore()

const emit = defineEmits<{
  (e: 'openNotebook', payload: Notebook): void
}>()

const openNotebook = async (notebook: Notebook) => emit('openNotebook', notebook)
</script>
