import { defineStore } from 'pinia'
import type { NotebookTreeItemClient, RenameTreeItem } from '#shared/types/notebook'
import type { FetchError } from 'ofetch'

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

  const { data: recentNotes, refresh: refreshRecentNotes } = useFetch<Note[]>('/api/notes', {
    immediate: true,
    lazy: true,
    query: { display: 4 }
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
  const findNotebookByPath = (pathArray: string[]): NotebookTreeItemClient | null => {
    if (!notebooks.value) return null
    // If pathArray is empty, return the root-level notebook
    if (pathArray.length === 0) {
      return null // Root-level notebooks are handled differently
    }

    // Navigate through the tree using pathArray as the hierarchy
    let currentItems = notebooks.value
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
        const targetNotebook = findNotebookByPath(notebook.pathArray)
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

  const addNotebook = async (
    name: string,
    notebook?: { name: string; apiPath: string; pathArray: string[] }
  ): Promise<Result<NotebookTreeItemClient>> => {
    if (!notebooks.value) {
      const { t } = useI18n()
      return { success: false, message: t('errors.notebookNotFound', { path: notebook?.name }) }
    }
    const notebookPath = notebook ? `${notebook.apiPath}/${name}` : name

    try {
      const resp = await $fetch<NotebookTreeItemClient>(`/api/notebook/${notebookPath}`, {
        method: 'POST'
      })

      if (notebook) {
        const targetNotebook = findNotebookByPath(notebook.pathArray)
        targetNotebook?.children?.push(resp)
      } else {
        notebooks.value.push(resp)
      }

      return {
        success: true,
        data: resp
      }
    } catch (error) {
      return { success: false, message: (error as FetchError).data.message }
    }
  }

  const addNote = async (
    state: NewNote,
    notebook: { name: string; apiPath: string; pathArray: string[] }
  ): Promise<Result<NotebookTreeItem>> => {
    if (!notebooks.value) {
      const { t } = useI18n()
      return { success: false, message: t('errors.notebookNotFound', { path: notebook.name }) }
    }

    const name = state.isManual ? state.name : `${state.name}.md`
    const notePath = notebook ? `${notebook.apiPath}/${name}` : name

    try {
      const resp = await $fetch<NotebookTreeItemClient>(`/api/note/${notePath}`, {
        method: 'POST'
      })

      const targetNotebook = findNotebookByPath(notebook.pathArray)
      targetNotebook?.children?.push(resp)

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

  const removeItemFromTree = (name: string, pathArray: string[]): void => {
    if (!notebooks.value) return

    if (pathArray.length === 1) {
      // Root-level notebook - remove from notebooks array
      const index = notebooks.value.findIndex((item) => item.label === name)
      if (index !== -1) {
        notebooks.value.splice(index, 1)
      }
    } else {
      // Nested notebook - find parent and remove from its children
      const parentPath = pathArray.slice(0, -1)
      const parentNotebook = findNotebookByPath(parentPath)
      if (parentNotebook?.children) {
        const index = parentNotebook.children.findIndex((item) => item.label === name)
        if (index !== -1) {
          parentNotebook.children.splice(index, 1)
        }
      }
    }
  }

  const replaceItemInTree = (originalName: string, originalPathArray: string[], renamedItem: RenameTreeItem): void => {
    if (!notebooks.value) return

    if (renamedItem.pathArray.length === 1) {
      // Root-level item - replace in notebooks array
      const index = notebooks.value.findIndex((item) => item.label === originalName)
      if (index !== -1) {
        const replacedItem: NotebookTreeItemClient = { ...notebooks.value[index]!, ...renamedItem }
        notebooks.value.splice(index, 1, replacedItem)
      }
    } else {
      // Nested item - find parent and replace in its children
      const parentPath = originalPathArray.slice(0, -1)
      const parentNotebook = findNotebookByPath(parentPath)
      if (parentNotebook?.children) {
        const index = parentNotebook.children.findIndex((item) => item.label === originalName)
        if (index !== -1) {
          const replacedItem: NotebookTreeItemClient = { ...notebooks.value[index]!, ...renamedItem }
          parentNotebook.children.splice(index, 1, replacedItem)
        }
      }
    }
  }

  const deleteNote = async (name: string, pathArray: string[], apiPath: string): Promise<Result<boolean>> => {
    try {
      const resp = await $fetch<boolean>(`/api/note/${apiPath}`, {
        method: 'DELETE'
      })

      removeItemFromTree(name, pathArray)

      return {
        success: true,
        data: resp
      }
    } catch (err) {
      const error = err as FetchError
      return {
        success: false,
        message: error.data.message
      }
    }
  }

  const deleteNotebook = async (name: string, pathArray: string[], apiPath: string): Promise<Result<boolean>> => {
    try {
      const resp = await $fetch<boolean>(`/api/notebook/${apiPath}`, {
        method: 'DELETE'
      })

      removeItemFromTree(name, pathArray)

      return {
        success: true,
        data: resp
      }
    } catch (err) {
      const error = err as FetchError
      return {
        success: false,
        message: error.data.message
      }
    }
  }

  const renameNotebook = async (
    apiPath: string,
    newNotebookName: string,
    originalName: string,
    originalPathArray: string[]
  ): Promise<Result<RenameTreeItem>> => {
    try {
      const resp = await $fetch<RenameTreeItem>(`/api/notebook/${apiPath}`, {
        method: 'PUT',
        body: {
          newName: newNotebookName
        }
      })

      replaceItemInTree(originalName, originalPathArray, resp)

      return { success: true, data: resp }
    } catch (err) {
      const error = (err as FetchError).data.message
      return { success: false, message: error }
    }
  }

  const renameNote = async (
    apiPath: string,
    newNoteName: string,
    originalName: string,
    originalPathArray: string[]
  ): Promise<Result<RenameTreeItem>> => {
    try {
      const resp = await $fetch<RenameTreeItem>(`/api/note/${apiPath}`, {
        method: 'PUT',
        body: {
          newName: newNoteName
        }
      })

      replaceItemInTree(originalName, originalPathArray, resp)

      return { success: true, data: resp }
    } catch (err) {
      const error = (err as FetchError).data.message
      return { success: false, message: error }
    }
  }

  return {
    notebooks,
    status,
    error,
    deleteNotebook,
    renameNotebook,
    renameNote,
    addNotebook,
    addNote,
    deleteNote,
    // Note
    toggleNotebook,
    toggleRootNotebook,
    // Get books
    fetchBooks,
    // state
    anyOpenBooks,
    closeAllOpenBooks,
    // Recents
    recentNotes,
    refreshRecentNotes
  }
})
