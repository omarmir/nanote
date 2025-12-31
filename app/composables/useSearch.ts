import { watchDebounced } from '@vueuse/core'
import { ref } from 'vue'
import type { Ref } from 'vue'
import type { USearchResult } from '#shared/types/ugrep'
import type { CommandPaletteItem } from '@nuxt/ui'

export function useSearch() {
  const search: Ref<string> = ref('')
  const query: Ref<{ q: string | null }> = ref({ q: null })
  const searchStatus: Ref<ActionStatus> = ref('idle')

  const {
    data: results,
    error,
    status,
    clear,
    refresh
  } = useFetch('/api/search', {
    immediate: false,
    lazy: true,
    query,
    transform: (
      searchRes: USearchResult[]
    ): CommandPaletteItem & { score: number; type: 'note' | 'folder' | 'content'; pathArray: string[] }[] => {
      return (
        searchRes.map((item, id) => {
          return {
            id,
            label: item.name,
            icon:
              item.matchType === 'folder'
                ? 'i-lucide-book'
                : item.matchType === 'note'
                  ? 'i-lucide-file'
                  : 'i-lucide-text',
            suffix: item.snippet,
            score: item.score,
            type: item.matchType,
            pathArray: item.pathArray
          }
        }) ?? []
      )
    }
  })

  watch(status, (newStatus) => {
    switch (newStatus) {
      case 'error':
        searchStatus.value = 'error'
        break
      case 'success':
        searchStatus.value = 'success'
        break
      case 'pending':
        searchStatus.value = 'pending'
        break
      default:
        searchStatus.value = 'idle'
    }
  })

  watch(search, (newVal) => {
    searchStatus.value = 'pending'
    if (!newVal || newVal.length === 0) {
      clear()
    }
  })

  watchDebounced(
    search,
    () => {
      if (search.value && search.value?.length > 0) {
        query.value = { q: search.value }
        refresh()
      } else {
        clear()
      }
    },
    { debounce: 500 }
  )

  // const noResults = computed(() => status.value === 'success' && search.value.length > 0 && results.value?.length === 0)

  // const clearSearch = () => {
  //   search.value = ''
  //   clear()
  // }

  return {
    search,
    // clearSearch,
    error,
    searchStatus,
    results
    // noResults
  }
}
