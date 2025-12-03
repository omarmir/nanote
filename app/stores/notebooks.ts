import { defineStore } from 'pinia'
import type { NotebookTreeItem } from '#shared/types/notebook'

// Extended type to track if children have been loaded
type NotebookTreeItemWithExpanded = NotebookTreeItem & {
  childrenLoaded?: boolean
}

export const useNotebookStore = defineStore('notebook', () => {
  const {
    data: notebooks,
    status,
    error,
    execute
  } = useFetch<NotebookTreeItemWithExpanded[]>('/api/notebook/*', {
    immediate: false,
    lazy: true,
    transform: (data: NotebookTreeItem[]) => {
      // Mark root level items as loaded since we fetched them
      return data.map((item) => ({
        ...item,
        childrenLoaded: false // Not expanded yet, children not loaded
      }))
    }
  })

  const fetchBooks = async () => {
    if (status.value === 'idle' && !notebooks.value) {
      await execute()
    }

    if (status.value === 'pending') {
      await new Promise<void>((resolve) => {
        const stopWatching = watch(
          status,
          (newStatus) => {
            if (newStatus !== 'pending') {
              stopWatching() // Stop watching once the status changes
              resolve()
            }
          },
          { immediate: true }
        )
      })
    }
  }

  const toggleNotebook = async (notebook: NotebookTreeItemWithExpanded): Promise<Result<null>> => {
    console.log(notebook)
    // If children are already loaded, nothing to do
    if (notebook.childrenLoaded) {
      return { success: true, data: null }
    }

    // If it's a note (not a notebook/folder), nothing to load
    if (notebook.isNote) {
      return { success: true, data: null }
    }

    try {
      // Fetch children from the API
      const children = await $fetch<NotebookTreeItem[]>(`/api/notebook/${notebook.apiPath}`)

      // Find the notebook in the tree using pathArray and add children
      if (notebooks.value) {
        const targetNotebook = findNotebookByPath(notebooks.value, notebook.pathArray)
        if (targetNotebook) {
          // Add children with childrenLoaded flag
          targetNotebook.children = children.map((child) => ({
            ...child,
            childrenLoaded: false
          }))
          targetNotebook.childrenLoaded = true
        }
      }

      return { success: true, data: null }
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to load notebook children'
      }
    }
  }

  // Helper function to traverse the tree and find a notebook by its pathArray
  const findNotebookByPath = (
    items: NotebookTreeItemWithExpanded[],
    pathArray: string[]
  ): NotebookTreeItemWithExpanded | null => {
    // Navigate through the tree using pathArray as the hierarchy
    let currentItems = items
    let currentNotebook: NotebookTreeItemWithExpanded | null = null

    for (const pathSegment of pathArray) {
      currentNotebook = currentItems.find((item) => item.label === pathSegment) || null
      if (!currentNotebook) {
        return null
      }
      // If not at the end, continue to children
      if (currentNotebook.children && pathArray.indexOf(pathSegment) < pathArray.length - 1) {
        currentItems = currentNotebook.children
      }
    }

    return currentNotebook
  }

  return {
    notebooks,
    status,
    error,
    // deleteNotebook,
    // addNotebook,
    // Note
    toggleNotebook,
    // Get books
    fetchBooks
  }
})
