import { watchDebounced } from '@vueuse/core'
import { ref } from 'vue'
import type { Ref } from 'vue'
import type { USearchResult } from '#shared/types/ugrep'
import { LazyNotebooksNew, LazyNotesNew, LazyCommonDelete, LazyNotebooksRename } from '#components'

export function useSearch(recentNotes?: Note[]) {
  const { t } = useI18n()
  const overlay = useOverlay()

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
          suffix: item.snippet
        }

        // 2. Explicitly separate the branches of your union
        if (item.matchType === 'folder') {
          return {
            ...base,
            icon: 'i-lucide-book',
            children: [
              {
                label: t('newNote'),
                icon: 'i-lucide-plus',
                onSelect: () => {
                  const modal = overlay.create(LazyNotesNew)
                  modal.open({ notebook: { name: item.name, apiPath: item.apiPath, pathArray: item.pathArray } })
                }
              },
              {
                label: t('newNotebook'),
                icon: 'i-lucide-plus',
                onSelect: () => {
                  const modal = overlay.create(LazyNotebooksNew)
                  modal.open({ notebook: { name: item.name, apiPath: item.apiPath, pathArray: item.pathArray } })
                }
              },
              {
                label: t('rename'),
                icon: 'i-custom-gg-rename',
                onSelect: () => {
                  const modal = overlay.create(LazyNotebooksRename)
                  modal.open({
                    originalAPIPath: item.apiPath,
                    originalPathArray: item.pathArray,
                    originalName: item.name
                  })
                }
              },
              {
                label: t('browse'),
                icon: 'i-lucide-list-tree'
              }
            ]
          }
        }

        // 3. The non-folder branch
        return {
          ...base,
          children: undefined,
          to: `/note/${item.apiPath}?ln=${item.lineNum}`
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
    },
    {
      id: 'recent-notes',
      label: t('recentNotes'),
      items:
        recentNotes?.map((recent, id) => {
          return {
            label: recent.name,
            id
          }
        }) ?? [],
      ignoreFilter: false
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
