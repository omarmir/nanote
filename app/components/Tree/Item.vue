<template>
  <li>
    <slot name="default" :is-open />
  </li>
</template>

<script lang="ts" setup>
const { item, expanded } = defineProps<{ item: NotebookTreeItemClient, expanded: string[] }>()

const isOpen = computed(() => expanded.includes(item.apiPath))
</script>
