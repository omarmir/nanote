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
          <Icon name="lucide:search" class="text-accent" />
        </span>
        <input
          id="search"
          ref="searchInput"
          v-model="search"
          placeholder="Search content"
          name="search"
          class="w-full rounded-sm border border-accent py-2 pe-10 ps-10 text-sm focus-visible:outline-none" />
        <button class="absolute right-8 mt-5 -translate-y-1/2 leading-none" @click="clearSearch()">
          <Icon name="lucide:x" class="size-4 text-gray-600" />
        </button>
      </div>
    </div>
    <div v-if="status === 'pending'" class="flex w-full flex-col items-center justify-center">
      <Icon
        name="lucide:loader-circle"
        class="size-8 animate-spin text-gray-600"
        :aria-busy="true"
        aria-live="polite"
        aria-details="Loading search results" />
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
