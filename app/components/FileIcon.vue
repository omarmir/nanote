<template>
  <div v-html="getIcon(name ?? '').svg" v-if="!isMarkdown" class="size-5 shrink-0"></div>
  <UIcon name="i-custom-ri-markdown-line" class="size-5 shrink-0 text-cyan-500" v-else></UIcon>
</template>

<script lang="ts" setup>
const { name, isMarkdown } = defineProps<{ name: string; isMarkdown?: boolean }>()
</script>
