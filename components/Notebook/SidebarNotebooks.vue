<template>
  <ul class="list-style-none flex flex-col gap-2">
    <li v-if="notebookStore.status === 'pending'" class="animate-pulse cursor-pointer select-none rounded-xl px-4 py-3">
      <div class="mb-2.5 h-2 w-4/5 rounded-full bg-gray-400/30"></div>
    </li>
    <li v-for="notebook in notebookStore.notebooks?.notebooks" :key="notebook.name" class="flex flex-col gap-2 px-4">
      <NotebookRenameNotebook type="sidebar" :notebook="notebook" :hide-rename="true"></NotebookRenameNotebook>
      <NotebookContents type="sidebar" :notebook="notebook"></NotebookContents>
      <CommonDangerAlert v-if="notebookStore.error" class="mb-4 mt-4">
        {{ notebookStore.error.data.message }}
      </CommonDangerAlert>
    </li>
  </ul>
</template>
<script lang="ts" setup>
const notebookStore = useNotebookStore()
</script>
