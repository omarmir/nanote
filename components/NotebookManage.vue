<template>
  <NuxtLink
    class="text-accent hover:text-accent-hover"
    :to="`/notebook/${[...notebook.notebooks, notebook.name].join('/')}`">
    <Icon name="lucide:book-open" class="size-5 shrink-0"></Icon>
  </NuxtLink>
</template>
<script lang="ts" setup>
import type { Notebook } from '~/types/notebook'

const { notebook } = defineProps<{ notebook: Notebook }>()
</script>
