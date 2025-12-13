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

  const addNotebook = async (
    name: string,
    notebook?: NotebookTreeItemClient
  ): Promise<Result<NotebookTreeItemClient>> => {
    if (!notebooks.value) {
      const { t } = useI18n()
      return { success: false, message: t('errors.notebookNotFound', { path: notebook?.label }) }
    }
    const notebookPath = notebook ? `${notebook.apiPath}/${name}` : name

    try {
      const resp = await $fetch<NotebookTreeItemClient>(`/api/notebook/${notebookPath}`, {
        method: 'POST'
      })

      if (notebook) {
        const targetNotebook = findNotebookByPath(notebooks.value, notebook.pathArray)
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

  const addNote = async (state: NewNote, notebook: NotebookTreeItemClient): Promise<Result<NotebookTreeItem>> => {
    if (!notebooks.value) {
      const { t } = useI18n()
      return { success: false, message: t('errors.notebookNotFound', { path: notebook.label }) }
    }

    const name = state.isManual ? state.name : `${state.name}.md`
    const notePath = notebook ? `${notebook.apiPath}/${name}` : name

    try {
      const resp = await $fetch<NotebookTreeItemClient>(`/api/note/${notePath}`, {
        method: 'POST'
      })

      const targetNotebook = findNotebookByPath(notebooks.value, notebook.pathArray)
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

  const removeItemFromTree = (notebooks: NotebookTreeItemClient[], notebook: NotebookTreeItemClient): void => {
    if (notebook.pathArray.length === 1) {
      // Root-level notebook - remove from notebooks array
      const index = notebooks.findIndex((item) => item.label === notebook.label)
      if (index !== -1) {
        notebooks.splice(index, 1)
      }
    } else {
      // Nested notebook - find parent and remove from its children
      const parentPath = notebook.pathArray.slice(0, -1)
      const parentNotebook = findNotebookByPath(notebooks, parentPath)
      if (parentNotebook?.children) {
        const index = parentNotebook.children.findIndex((item) => item.label === notebook.label)
        if (index !== -1) {
          parentNotebook.children.splice(index, 1)
        }
      }
    }
  }

  const replaceItemInTree = (
    notebooks: NotebookTreeItemClient[],
    oldItem: NotebookTreeItemClient,
    newItem: NotebookTreeItemClient
  ): void => {
    if (oldItem.pathArray.length === 1) {
      // Root-level item - replace in notebooks array
      const index = notebooks.findIndex((item) => item.label === oldItem.label)
      if (index !== -1) {
        notebooks.splice(index, 1, newItem)
      }
    } else {
      // Nested item - find parent and replace in its children
      const parentPath = oldItem.pathArray.slice(0, -1)
      const parentNotebook = findNotebookByPath(notebooks, parentPath)
      if (parentNotebook?.children) {
        const index = parentNotebook.children.findIndex((item) => item.label === oldItem.label)
        if (index !== -1) {
          parentNotebook.children.splice(index, 1, newItem)
        }
      }
    }
  }

  const deleteNote = async (note: NotebookTreeItemClient): Promise<Result<boolean>> => {
    if (!notebooks.value) {
      const { t } = useI18n()
      return { success: false, message: t('errors.notebookNotFound', { path: note.label }) }
    }
    try {
      const resp = await $fetch<boolean>(`/api/note/${note.apiPath}`, {
        method: 'DELETE'
      })

      removeItemFromTree(notebooks.value, note)

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

  const deleteNotebook = async (notebook: NotebookTreeItemClient): Promise<Result<boolean>> => {
    if (!notebooks.value) {
      const { t } = useI18n()
      return { success: false, message: t('errors.notebookNotFound', { path: notebook.label }) }
    }

    try {
      const resp = await $fetch<boolean>(`/api/notebook/${notebook.apiPath}`, {
        method: 'DELETE'
      })

      removeItemFromTree(notebooks.value, notebook)

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
    notebook: NotebookTreeItemClient,
    newNotebookName: string
  ): Promise<Result<NotebookTreeItemClient>> => {
    if (!notebooks.value) {
      const { t } = useI18n()
      return { success: false, message: t('errors.notebookNotFound', { path: notebook.label }) }
    }

    try {
      const resp = await $fetch<RenameTreeItem>(`/api/notebook/${notebook.apiPath}`, {
        method: 'PUT',
        body: {
          newName: newNotebookName
        }
      })

      const replacedItem = { ...notebook, ...resp }

      replaceItemInTree(notebooks.value, notebook, replacedItem)

      return { success: true, data: replacedItem }
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
    closeAllOpenBooks
  }
})
