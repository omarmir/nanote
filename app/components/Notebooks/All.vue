<template>
  {{ notebookStore.notebooks }}
</template>
<script lang="ts" setup>
const notebookStore = useNotebookStore()
const notebookAddedError: Ref<string | null> = ref(null)
</script>
