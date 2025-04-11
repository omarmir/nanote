<template>
  <NuxtLink
    class="text-teal-600 hover:text-teal-800"
    :to="`/notebook/${[...notebook.notebooks, notebook.name].join('/')}`">
    <IconsOpenNotebook class="size-5 shrink-0"></IconsOpenNotebook>
  </NuxtLink>
</template>
<script lang="ts" setup>
import type { Notebook } from '~/types/notebook'

const { notebook } = defineProps<{ notebook: Notebook }>()
</script>
