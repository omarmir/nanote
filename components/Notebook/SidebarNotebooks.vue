<template>
  <ul class="list-style-none">
    <li v-if="status === 'pending'" class="animate-pulse cursor-pointer select-none rounded-xl px-4 py-3">
      <div class="mb-2.5 h-2 w-4/5 rounded-full bg-gray-400/30"></div>
    </li>
    <li
      v-for="notebook in data?.notebooks"
      :key="notebook.name"
      class="items-center px-4 py-1"
      :class="{ 'bg-cyan-300/5': notebook.name === notebookStore.sidebarNotebookPath[0] }">
      <div class="lg:hidden">
        <NotebookContents
          type="sidebar"
          :on-background="false"
          :notebook="notebook"
          :show-children="true"></NotebookContents>
        <CommonDangerAlert v-if="error" class="mb-4 mt-4">{{ error.data.message }}</CommonDangerAlert>
      </div>
      <div class="hidden lg:block">
        <NotebookContents
          type="sidebar"
          :on-background="false"
          :notebook="notebook"
          :show-children="false"
          @opened="(contents) => emit('opened', contents)"></NotebookContents>
        <CommonDangerAlert v-if="error" class="mb-4 mt-4">{{ error.data.message }}</CommonDangerAlert>
      </div>
    </li>
  </ul>
</template>
<script lang="ts" setup>
import { useNotebookStore } from '~/stores/notebooks'
import type { NotebookContents } from '~/types/notebook'
const { data, status, error } = useFetch<NotebookContents>('/api/notebook', {
  immediate: true,
  lazy: false
})

const notebookStore = useNotebookStore()

const emit = defineEmits<{
  (e: 'opened', payload: NotebookContents | null): void
}>()
</script>
