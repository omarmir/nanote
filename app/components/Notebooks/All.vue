<template>
  <div>
    <div class="mb-6 flex flex-row items-center justify-between">
      <div class="flex flex-row items-center gap-2">
        <h1 class="text-2xl font-bold">{{ t('Notebook', 2) }}</h1>
        <UButton
          icon="i-lucide-fold-vertical"
          size="md"
          @click="notebookStore.closeAllOpenBooks()"
          color="warning"
          :class="{ invisible: notebookStore.anyOpenBooks === false }"
          variant="ghost"
          :title="t('closeNotebooks', 2)"></UButton>
      </div>
      <NotebooksNew></NotebooksNew>
    </div>
    <ul v-if="notebookStore.notebooks" class="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <li v-for="notebook in notebookStore.notebooks">
        <NotebooksRoot :notebook></NotebooksRoot>
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
const notebookStore = useNotebookStore()
const { t } = useI18n()

await notebookStore.fetchBooks()
</script>
