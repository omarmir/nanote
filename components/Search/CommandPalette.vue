<template>
  <CommonBaseDialog
    v-model="isShown"
    :is-command="true"
    :hide-title-desc="true"
    position="top"
    theme="primary"
    title="Search results"
    desc="Quick shortcuts and search">
    <div class="flex flex-col gap-4">
      <label for="command" class="hidden">Search</label>
      <div class="flex w-full">
        <span class="absolute ml-3 mt-5 -translate-y-1/2 leading-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-5 text-accent">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path>
          </svg>
        </span>
        <input
          id="search"
          ref="searchInput"
          v-model="search"
          placeholder="Search content"
          name="search"
          class="w-full rounded-sm border border-accent py-2 pe-10 ps-10 text-sm focus-visible:outline-none" />
        <button class="absolute right-8 mt-5 -translate-y-1/2 leading-none" @click="clearSearch()">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-gray-600" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z" />
          </svg>
        </button>
      </div>
    </div>
    <div v-if="status === 'pending'" class="flex w-full flex-col items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="size-8"
        viewBox="0 0 24 24"
        :aria-busy="true"
        aria-live="polite"
        aria-details="Loading search results">
        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
          <path stroke-dasharray="16" stroke-dashoffset="16" d="M12 3c4.97 0 9 4.03 9 9">
            <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="16;0" />
            <animateTransform
              attributeName="transform"
              dur="1.5s"
              repeatCount="indefinite"
              type="rotate"
              values="0 12 12;360 12 12" />
          </path>
          <path
            stroke-dasharray="64"
            stroke-dashoffset="64"
            stroke-opacity="0.3"
            d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z">
            <animate fill="freeze" attributeName="stroke-dashoffset" dur="1.2s" values="64;0" />
          </path>
        </g>
      </svg>
    </div>
    <div v-if="!debounced" class="w-full text-center">
      <p class="text-sm text-gray-900 dark:text-gray-400">Begin typing to search content</p>
    </div>
    <div v-if="error && status === 'error'">
      <CommonDangerAlert>{{ error }}</CommonDangerAlert>
    </div>
    <div v-if="noResults">
      <SearchNoResults :search></SearchNoResults>
    </div>
    <div v-else>
      <SearchResults :results @navigate="navigate"></SearchResults>
    </div>
  </CommonBaseDialog>
</template>
<script lang="ts" setup>
import { useSearch } from '~/composables/useSearch'
import type { SearchResult } from '~/types/notebook'
const router = useRouter()
const isShown = defineModel<boolean>({ required: true })
const searchInput = useTemplateRef('searchInput')
const { search, clearSearch, results, clear, noResults, status, error, debounced } = useSearch()

watch(isShown, async () => {
  await nextTick()
  if (!isShown.value) {
    clear()
    search.value = ''
  } else {
    searchInput.value?.focus()
  }
})

const navigate = (result: SearchResult) => {
  const route =
    result.matchType === 'folder'
      ? `/notebook/${result.notebook.join('/')}`
      : `/note/${result.notebook.join('/')}/${result.name}`
  router.push(route)
  isShown.value = false
}
</script>
