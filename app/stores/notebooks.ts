import { defineStore } from 'pinia'
import type { NotebookTreeItem } from '#shared/types/notebook'

export const useNotebookStore = defineStore('notebook', () => {
  const {
    data: notebooks,
    status,
    error,
    execute
  } = useFetch<NotebookTreeItem[]>('/api/notebook/*', {
    immediate: false,
    lazy: true
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

  // Helper function to traverse the tree and find a notebook by its pathArray
  const findNotebookByPath = (
    items: NotebookTreeItemWithExpanded[],
    pathArray: string[]
  ): NotebookTreeItemWithExpanded | null => {
    // If pathArray is empty, return the root-level notebook
    if (pathArray.length === 0) {
      return null // Root-level notebooks are handled differently
    }

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
        } else if (notebook.pathArray.length === 0) {
          // Handle root-level notebooks
          notebook.children = children.map((child) => ({
            ...child,
            childrenLoaded: false
          }))
          notebook.childrenLoaded = true
          console.log(notebook)
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
