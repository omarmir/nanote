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
          class="cursor-pointer"
          :class="{ invisible: notebookStore.anyOpenBooks === false }"
          variant="ghost"
          :title="t('closeNotebooks', 2)"></UButton>
      </div>
      <UButton icon="i-lucide-plus" size="md" color="neutral" variant="outline" :title="t('newNotebook')">
        {{ t('Notebook', 1) }}
      </UButton>
    </div>
    <ul v-if="notebookStore.notebooks" class="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <li v-for="notebook in notebookStore.notebooks">
        <NotebooksRoot :notebook :is-default-open="isDefaultOpen"></NotebooksRoot>
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
const notebookStore = useNotebookStore()
const { t } = useI18n()

await notebookStore.fetchBooks()

const notebookAddedError: Ref<string | null> = ref(null)

const isDefaultOpen = ref(false)
</script>
