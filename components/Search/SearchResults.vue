<template>
  <ul>
    <li v-for="(result, index) in results" :key="index">
      <button
        :title="result.matchType === 'content' ? `Content of note includes: ${result.snippet}` : result.snippet"
        class="flex w-full cursor-pointer flex-row gap-2 px-4 py-2 text-left text-xs text-gray-900 hover:bg-accent hover:text-white focus-visible:bg-accent focus-visible:text-white focus-visible:outline-none dark:text-gray-200"
        @click="navigate(result)">
        <IconsNotebook v-if="result.matchType === 'folder'" class="size-5 grow-0"></IconsNotebook>
        <IconsNote v-else-if="result.matchType === 'note'"></IconsNote>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="size-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M5 3c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 2h14v14H5zm2 2v2h10V7zm0 4v2h10v-2zm0 4v2h7v-2z" />
        </svg>
        <div class="flex flex-col gap-1">
          <span>{{ [...result.notebook, result.name].join('/') }}</span>
          <span class="italic">{{ result.snippet }}</span>
        </div>
      </button>
    </li>
  </ul>
</template>
<script lang="ts" setup>
import { IconsNote } from '#components'
import type { SearchResult } from '~/types/notebook'
const { results } = defineProps<{ results: SearchResult[] | null }>()

const emit = defineEmits<{
  (e: 'navigate', payload: SearchResult): void
}>()

const navigate = (result: SearchResult) => emit('navigate', result)
</script>
