<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">{{ t('Notebook', 2) }}</h1>
    <ul v-if="notebookStore.notebooks?.notebooks" class="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <li v-for="notebook in notebookStore.notebooks?.notebooks">
        <NotebooksSingle :notebook></NotebooksSingle>
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
const notebookStore = useNotebookStore()
const { t } = useI18n()

const notebookAddedError: Ref<string | null> = ref(null)
</script>
