import { watchDebounced } from '@vueuse/core'
import { ref, triggerRef } from 'vue'
import type { Ref } from 'vue'
import type { SearchMatchType, USearchResult } from '#shared/types/ugrep'
import type { CommandPaletteItem } from '@nuxt/ui'

type SearchDisplayResult = CommandPaletteItem & {
  score: number
  type: SearchMatchType
  pathArray: string[]
}

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
    deep: true,
    query,
    transform: (searchRes: USearchResult[]): SearchDisplayResult[] => {
      return searchRes.map((item, id) => {
        // 1. Common properties shared by all types
        const base = {
          id,
          label: item.name,
          suffix: item.snippet,
          score: item.score,
          pathArray: item.pathArray
        }

        // 2. Explicitly separate the branches of your union
        if (item.matchType === 'folder') {
          return {
            ...base,
            type: 'folder',
            icon: 'i-lucide-book',
            children: item.children ?? [], // Ensure this is not undefined
            childrenLoaded: false,
            onClick: () => updateChildren(item.pathArray)
          } satisfies SearchDisplayResult
        }

        // 3. The non-folder branch
        return {
          ...base,
          type: item.matchType, // TypeScript knows this is 'note' | 'content' | 'loading' now
          icon:
            item.matchType === 'note'
              ? 'i-lucide-file'
              : item.matchType === 'loading'
                ? 'i-lucide-loader-circle'
                : 'i-lucide-text',
          children: undefined,
          childrenLoaded: undefined,
          onClick: () => {},
          to: `/note/${item.pathArray.join('/')}?ln=${item.lineNum}`
        } satisfies SearchDisplayResult
      })
    }
  })

  const findItemByPathArray = (pathArray: string[]): SearchDisplayResult | null => {
    if (!results.value || pathArray.length === 0) return null

    // We treat the current level as an array of SearchDisplayResult
    let currentLevel: SearchDisplayResult[] = results.value
    let foundItem: SearchDisplayResult | null = null

    for (let i = 0; i < pathArray.length; i++) {
      const pathSegment = pathArray[i]

      // Find the item in the current level
      const match = currentLevel.find((item) => item.label === pathSegment)

      if (!match) return null

      foundItem = match

      // If we aren't at the last segment of the path, we need to go deeper
      if (i < pathArray.length - 1) {
        return match.type === 'folder' ? match : null
      }
    }

    return foundItem
  }

  const updateChildren = async (originalPathArray: string[]): Promise<void> => {
    const loadChilren = await $fetch<NotebookTreeItem[]>(`/api/notebook/${originalPathArray.join('/')}`)
    const item = findItemByPathArray(originalPathArray)
    if (item && loadChilren) {
      item.childrenLoaded = true
      item.children = [
        {
          pathArray: '',
          name: 'test',
          matchType: 'note',
          snippet: 'Test',
          score: 0,
          lineNum: 0
        }
      ]
      // loadChilren.map((child) => {
      //   return {
      //     pathArray: child.pathArray,
      //     name: child.label,
      //     matchType: 'note',
      //     snippet: 'Test',
      //     score: 0,
      //     lineNum: 0
      //   }
      // })

      if (results.value) {
        results.value = [...results.value]
      }
    }

    console.log('item', item)

    console.log('result', results)
  }

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
      // clear()
    }
  })

  watchDebounced(
    search,
    () => {
      if (search.value && search.value?.length > 0) {
        query.value = { q: search.value }
        refresh()
      } else {
        // clear()
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
