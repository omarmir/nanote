<template>
  <ul>
    <li v-for="(result, index) in results" :key="index">
      <button
        class="flex w-full cursor-pointer flex-row gap-2 px-4 py-2 text-left text-xs text-gray-900 hover:bg-accent hover:text-white focus-visible:bg-accent focus-visible:text-white focus-visible:outline-none dark:text-gray-200"
        @click="navigate(result)">
        <svg
          v-if="result.matchType === 'folder'"
          xmlns="http://www.w3.org/2000/svg"
          class="size-4 shrink-0"
          viewBox="0 0 1024 1024">
          <path
            fill="currentColor"
            d="M192 128v768h640V128zm-32-64h704a32 32 0 0 1 32 32v832a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32" />
          <path
            fill="currentColor"
            d="M672 128h64v768h-64zM96 192h128q32 0 32 32t-32 32H96q-32 0-32-32t32-32m0 192h128q32 0 32 32t-32 32H96q-32 0-32-32t32-32m0 192h128q32 0 32 32t-32 32H96q-32 0-32-32t32-32m0 192h128q32 0 32 32t-32 32H96q-32 0-32-32t32-32" />
        </svg>
        <svg
          v-else-if="result.matchType === 'note'"
          xmlns="http://www.w3.org/2000/svg"
          class="size-4 shrink-0"
          viewBox="0 0 24 24">
          <path fill="currentColor" d="M4 22V2h10l6 6v14zm9-13V4H6v16h12V9zM6 4v5zv16z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="size-4 shrink-0" viewBox="0 0 24 24">
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
import type { SearchResult } from '~/types/notebook'
const { results } = defineProps<{ results: SearchResult[] | null }>()

const emit = defineEmits<{
  (e: 'navigate', payload: SearchResult): void
}>()

const navigate = (result: SearchResult) => emit('navigate', result)
</script>
