import { defineStore } from 'pinia'
import type { NotebookTreeItemClient } from '#shared/types/notebook'

export const useNotebookStore = defineStore('notebook', () => {
  const {
    data: notebooks,
    status,
    error,
    execute
  } = useFetch<NotebookTreeItemClient[]>('/api/notebook/*', {
    immediate: false,
    lazy: true,
    deep: true,
    transform: (books: NotebookTreeItem[]): NotebookTreeItemClient[] => {
      return books.map((book) => {
        return { ...book, childrenLoaded: false, isOpen: false }
      })
    }
  })

  const getNotePaths = (notebooks: string[], note: string): { apiPath: string; notePath: string[] } => {
    const notePath = [...notebooks, note]
    const apiPath = notePathArrayJoiner(notePath)
    return { apiPath, notePath }
  }

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
  const findNotebookByPath = (items: NotebookTreeItemClient[], pathArray: string[]): NotebookTreeItemClient | null => {
    // If pathArray is empty, return the root-level notebook
    if (pathArray.length === 0) {
      return null // Root-level notebooks are handled differently
    }

    // Navigate through the tree using pathArray as the hierarchy
    let currentItems = items
    let currentNotebook: NotebookTreeItemClient | null = null

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

  const toggleRootNotebook = async (notebook: NotebookTreeItemClient): Promise<Result<null>> => {
    // if its already open close it
    if (notebook.isOpen) {
      notebook.isOpen = false
      return { success: true, data: null }
    } else {
      notebook.isOpen = true
    }
    return toggleNotebook(notebook)
  }

  const toggleNotebook = async (notebook: NotebookTreeItemClient): Promise<Result<null>> => {
    // If it's a note (not a notebook/folder), nothing to load
    if (notebook.isNote) {
      return { success: true, data: null }
    }

    // If children are already loaded, nothing to do
    if (notebook.childrenLoaded) {
      return { success: true, data: null }
    }

    try {
      // Fetch children from the API
      const children = await $fetch<NotebookTreeItemClient[]>(`/api/notebook/${notebook.apiPath}`)

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

  const addNotebook = async (name: string, notebook?: Notebook): Promise<Result<Notebook>> => {
    const notebookPath = notebook ? [...(notebook?.notebooks ?? []), notebook?.name ?? ''] : []
    const { apiPath } = getNotePaths(notebookPath, name)

    try {
      const resp = await $fetch<Notebook>(`/api/notebook/${apiPath}`, {
        method: 'POST'
      })

      const nb = getNotebookByPathArray(notebookPath, notebooks.value)

      //if the notebook is entered at the top level
      if (notebookPath.length === 0 && notebooks.value) {
        if (!notebooks.value.notebooks) notebooks.value.notebooks = {}
        notebooks.value.notebooks[resp.name] = resp
      } else {
        if (nb?.contents) {
          if (!nb.contents.notebooks) nb.contents.notebooks = {}
          nb.contents.notebooks[resp.name] = resp
        }
      }
      return {
        success: true,
        data: resp
      }
    } catch (error) {
      return { success: false, message: (error as FetchError).data.message }
    }
  }

  const anyOpenBooks: ComputedRef<boolean> = computed(() => notebooks.value?.some((book) => book.isOpen) ?? false)
  const closeAllOpenBooks = () =>
    notebooks.value?.forEach((book) => {
      if (book.isOpen) book.isOpen = false
    })

  return {
    notebooks,
    status,
    error,
    // deleteNotebook,
    // addNotebook,
    // Note
    toggleNotebook,
    toggleRootNotebook,
    // Get books
    fetchBooks,
    // state
    anyOpenBooks,
    closeAllOpenBooks
  }
})
