<template>
  <div>
    <div class="mb-6 flex flex-row items-center justify-between">
      <div class="flex flex-row items-center gap-2">
        <h1 class="text-2xl font-bold">
          {{ t('Notebook', 2) }}
        </h1>
        <UButton
          icon="i-lucide-fold-vertical"
          size="md"
          color="warning"
          :class="{ invisible: notebookStore.anyOpenBooks === false }"
          variant="ghost"
          :title="t('closeNotebooks', 2)"
          @click="notebookStore.closeAllOpenBooks()" />
      </div>
      <NotebooksNew>
        <template #trigger>
          <UButton icon="i-lucide-plus" size="md" color="neutral" variant="outline" :title="t('newNotebook')">
            {{ t('Notebook', 1) }}
          </UButton>
        </template>
      </NotebooksNew>
    </div>
    <ul v-if="notebookStore.notebooks" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <li v-for="notebook in notebookStore.notebooks" :key="notebook.apiPath">
        <NotebooksRoot :notebook />
      </li>
    </ul>
    <UAlert
      v-if="notebookStore.error"
      color="error"
      variant="outline"
      icon="i-lucide-circle-alert"
      :title="t('failure')"
      :description="
        notebookStore.error.data.message ?? notebookStore.error.message ?? notebookStore.error.statusMessage
      "
      as="div" />
  </div>
</template>

<script lang="ts" setup>
const notebookStore = useNotebookStore()
const { t } = useI18n()
</script>
