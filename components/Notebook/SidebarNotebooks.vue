<template>
  <ul class="list-style-none">
    <li v-if="notebookStore.status === 'pending'" class="animate-pulse cursor-pointer select-none rounded-xl px-4 py-3">
      <div class="mb-2.5 h-2 w-4/5 rounded-full bg-gray-400/30"></div>
    </li>
    <li
      v-for="notebook in notebookStore.notebooks?.notebooks"
      :key="notebook.name"
      class="items-center px-4"
      :class="{ 'bg-cyan-300/5': notebook.name === notebookStore.sidebarTopLevel?.[0] }">
      <div>
        <NotebookContents type="sidebar" :on-background="false" :notebook="notebook"></NotebookContents>
        <CommonDangerAlert v-if="notebookStore.error" class="mb-4 mt-4">
          {{ notebookStore.error.data.message }}
        </CommonDangerAlert>
      </div>
    </li>
  </ul>
</template>
<script lang="ts" setup>
import type { NotebookContents } from '~/types/notebook'
const notebookStore = useNotebookStore()
</script>
