import { watchDebounced } from '@vueuse/core'
import { ref } from 'vue'
import type { Ref } from 'vue'
import type { USearchResult } from '#shared/types/ugrep'

export function useSearch() {
  const { t } = useI18n()

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
    deep: true,
    query,
    transform: (searchRes: USearchResult[]) =>
      searchRes?.map((item, id) => {
        // 1. Common properties shared by all types
        const base = {
          id,
          label: item.name,
          suffix: item.snippet,
          chip: {
            color: item.score > 90 ? ('primary' as const) : item.score > 50 ? ('warning' as const) : ('error' as const)
          }
        }

        // 2. Explicitly separate the branches of your union
        if (item.matchType === 'folder') {
          return {
            ...base,
            icon: 'i-lucide-book',
            disabled: true
          }
        }

        // 3. The non-folder branch
        return {
          ...base,
          icon: item.matchType === 'note' ? 'i-lucide-file' : 'i-lucide-text',
          children: undefined,
          to: `/note/${item.pathArray.join('/')}?ln=${item.lineNum}`
        }
      }) ?? []
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

  const groups = computed(() => [
    {
      id: 'search-notes',
      label: t('searchResults', { searchTerm: search.value }),
      items: results.value || [],
      ignoreFilter: true
    }
  ])

  return {
    search,
    groups,
    error,
    searchStatus,
    results
  }
}
