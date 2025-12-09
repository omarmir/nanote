<template>
  <div
    v-if="!isMarkdown"
    class="size-5 shrink-0"
    v-html="getIcon(name ?? '').svg"
  />
  <UIcon
    v-else
    name="i-custom-ri-markdown-line"
    class="size-5 shrink-0 text-cyan-500"
  />
</template>

<script lang="ts" setup>
const { name, isMarkdown } = defineProps<{ name: string, isMarkdown?: boolean }>()
</script>
