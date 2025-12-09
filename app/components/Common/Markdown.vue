<template>
  <span v-html="String(parsed)" />
</template>

<script lang="ts" setup>
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkHTML from 'remark-html'

const { content } = defineProps<{ content: string }>()
const markdownProcessor = unified().use(remarkParse).use(remarkGfm).use(remarkHTML)

const parsed = await markdownProcessor.process(content)
</script>
