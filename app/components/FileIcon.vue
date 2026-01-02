<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-if="!isMD" :data-name="name" class="size-5 shrink-0" v-html="getIcon(name ?? '').svg" />
  <UIcon v-else name="i-custom-ri-markdown-line" class="size-5 shrink-0 text-cyan-500" />
</template>

<script lang="ts" setup>
const { name, isMarkdown } = defineProps<{ name: string; isMarkdown?: boolean }>()

const isMD = isMarkdown ?? name.toLowerCase().endsWith('.md')
</script>
