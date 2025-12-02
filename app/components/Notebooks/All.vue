<template>
  <div>
    <div class="flex flex-row items-center justify-between">
      <h1 class="mb-6 text-2xl font-bold">{{ t('Notebook', 2) }}</h1>
      <UButton icon="i-lucide-plus" size="md" color="neutral" variant="outline" :title="t('newNotebook')">
        {{ t('Notebook', 1) }}
      </UButton>
    </div>
    <ul v-if="notebookStore.notebooks?.notebooks" class="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <li v-for="notebook in notebookStore.notebooks?.notebooks">
        <NotebooksRoot :notebook></NotebooksRoot>
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
const notebookStore = useNotebookStore()
const { t } = useI18n()

await notebookStore.fetchBooks()

const notebookAddedError: Ref<string | null> = ref(null)
</script>
