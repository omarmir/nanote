<template>
  <ul>
    <li v-for="(result, index) in results" :key="index">
      <button
        :title="result.matchType === 'content' ? `Content of note includes: ${result.snippet}` : result.snippet"
        class="flex w-full cursor-pointer flex-row gap-2 px-4 py-2 text-left text-xs text-gray-900 hover:bg-accent hover:text-white focus-visible:bg-accent focus-visible:text-white focus-visible:outline-none dark:text-gray-200"
        @click="navigate(result)">
        <Icon v-if="result.matchType === 'folder'" class="size-5 grow-0" name="lucide:book" />
        <Icon v-else-if="result.matchType === 'note'" name="lucide:file" class="size-5 grow-0" />
        <Icon v-else name="lucide:text" class="size-5 grow-0" />
        <div class="flex flex-col gap-1">
          <span>{{ [...result.notebook, result.name?.replace(/\.md$/, '')].join('/') }}</span>
          <span class="italic">{{ result.snippet }}</span>
        </div>
      </button>
    </li>
  </ul>
</template>
<script lang="ts" setup>
import type { SearchResult } from '~/types/notebook'
const { results } = defineProps<{ results: SearchResult[] | null }>()

const emit = defineEmits<{
  (e: 'navigate', payload: SearchResult): void
}>()

const navigate = (result: SearchResult) => emit('navigate', result)
</script>
