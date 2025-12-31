import { watchDebounced } from '@vueuse/core'
import { ref } from 'vue'
import type { Ref } from 'vue'
import type { USearchResult } from '#shared/types/ugrep'

export function useSearch() {
  const search: Ref<string> = ref('')
  const query: Ref<{ q: string | null }> = ref({ q: null })

  const {
    data: results,
    error,
    status,
    clear
  } = useFetch<USearchResult[]>('/api/search', {
    immediate: false,
    lazy: true,
    query,
    transform: (searchRes) => {
      return searchRes.map((res) => {
        return {
          ...res,
          snippet: res.snippet
        }
      })
    }
  })

  watchDebounced(
    search,
    () => {
      if (search.value && search.value?.length > 0) {
        query.value = { q: search.value }
      } else {
        clear()
      }
    },
    { debounce: 500 }
  )

  const noResults = computed(() => status.value === 'success' && (results.value?.length === 0 || !results.value))

  const clearSearch = () => {
    search.value = ''
    clear()
  }

  return {
    search,
    clearSearch,
    error,
    status,
    results,
    noResults
  }
}
