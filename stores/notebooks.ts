import { defineStore } from 'pinia'
import type {
  DeleteNote,
  DeleteNotebook,
  Note,
  Notebook,
  NotebookContents,
  NotebookDisplay,
  RenameNote,
  RenameNotebook
} from '~/types/notebook'
import type { Result } from '~/types/result'
import type { FetchError } from 'ofetch'

export const useNotebookStore = defineStore('notebook', () => {
  const {
    data: notebooks,
    status,
    error
  } = useFetch<NotebookContents>('/api/notebook', {
    immediate: true,
    lazy: false
  })

  const mainTopLevel: Ref<string[] | null> = ref(null)
  const sidebarTopLevel: Ref<string[] | null> = ref(null)

  const getNotebookPaths = (notebook: Notebook): { apiPath: string; notebookPath: string[] } => {
    const apiPath = notebookPathArrayJoiner(notebook)
    const notebookPath = [...notebook.notebooks, notebook.name]

    return { apiPath, notebookPath }
  }

  const getNotePaths = (notebooks: string[], note: string): { apiPath: string; notePath: string[] } => {
    const notePath = [...notebooks, note]
    const apiPath = notePathArrayJoiner(notePath)
    return { apiPath, notePath }
  }

  const openNotebook = async (notebook: Notebook, type: NotebookDisplay): Promise<Result<NotebookContents>> => {
    const { apiPath, notebookPath } = getNotebookPaths(notebook)
    try {
      const resp = await $fetch<NotebookContents>(`/api/notebook/${apiPath}`)
      const nb = getNotebookByPathArray(notebookPath, notebooks.value)
      if (nb) {
        nb.contents = resp
      } else {
        notebooks.value = resp
      }
      if (type === 'main') {
        mainTopLevel.value = notebookPath
      } else {
        sidebarTopLevel.value = notebookPath
      }

      return { success: true, data: resp }
    } catch (error) {
      const err = error as FetchError
      return { success: false, message: err.data.message ?? err.message ?? 'Unknown error' }
    }
  }

  const renameNotebook = async (notebook: Notebook, newNotebookName: string): Promise<Result<RenameNotebook>> => {
    const { apiPath, notebookPath } = getNotebookPaths(notebook)

    try {
      const resp = await $fetch<RenameNotebook>(`/api/notebook/${apiPath}`, {
        method: 'PUT',
        body: {
          newName: newNotebookName
        }
      })
      const nb = getNotebookByPathArray(notebookPath, notebooks.value)
      if (nb) {
        nb.name = resp.newName
        nb.path = resp.path
      }
      return { success: true, data: resp }
    } catch (err) {
      const error = (err as FetchError).data.message
      return { success: false, message: error }
    }
  }

  const currentLevel = (notebook: Notebook, type: NotebookDisplay): boolean => {
    const { notebookPath } = getNotebookPaths(notebook)
    if (type === 'main' && mainTopLevel.value) {
      //@ts-expect-error Should not error as its inside a guard
      return notebookPath.every((item, index) => item === mainTopLevel.value[index])
    } else if (type === 'sidebar' && sidebarTopLevel.value) {
      //@ts-expect-error Should not error as its inside a guard
      return notebookPath.every((item, index) => item === sidebarTopLevel.value[index])
    }

    return false
  }

  const resetSidebarNotebook = () => (sidebarTopLevel.value = null)

  const deleteNotebook = async (notebook: Notebook): Promise<Result<DeleteNotebook>> => {
    const { apiPath } = getNotebookPaths(notebook)

    try {
      const resp = await $fetch<DeleteNotebook>(`/api/notebook/${apiPath}`, {
        method: 'DELETE'
      })

      const success: Result<DeleteNotebook> = {
        success: true,
        data: resp
      }

      if (notebook.notebooks.length === 0) {
        delete notebooks.value?.notebooks?.[notebook.name]
      } else {
        const parentPath = notebook.notebooks
        const nb = getNotebookByPathArray(parentPath, notebooks.value)
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        if (nb?.contents?.notebooks?.[notebook.name]) delete nb.contents.notebooks[notebook.name]
      }

      return success
    } catch (err) {
      const error = err as FetchError
      return {
        success: false,
        message: error.data.message
      }
    }
  }

  const deleteNote = async (notebookPath: string[], note: string): Promise<Result<DeleteNote>> => {
    const { apiPath } = getNotePaths(notebookPath, note)
    try {
      const resp = await $fetch<DeleteNote>(`/api/note/${apiPath}`, {
        method: 'DELETE'
      })

      const nb = getNotebookByPathArray(notebookPath, notebooks.value)
      if (nb?.contents) {
        nb.contents.notes = nb.contents.notes.filter((item) => item.name !== note)
      }

      return {
        success: true,
        data: resp
      }
    } catch (error) {
      return { success: false, message: (error as FetchError).data.message }
    }
  }

  const renameNote = async (notebookPath: string[], note: string, newName: string): Promise<Result<RenameNote>> => {
    const { apiPath } = getNotePaths(notebookPath, note)
    try {
      const rename = await $fetch<RenameNote>(`/api/note/${apiPath}`, {
        body: { newName },
        method: 'PUT'
      })

      const nb = getNotebookByPathArray(notebookPath, notebooks.value)
      if (nb?.contents) {
        const idx = nb.contents.notes.findIndex((item) => item.name === rename.oldName)
        if (idx >= 0) {
          nb.contents.notes[idx].name = rename.newName
        }
      }

      return {
        success: true,
        data: rename
      }
    } catch (e) {
      const err = e as FetchError
      return {
        success: false,
        message: err.data?.message ?? err
      }
    }
  }

  const addNote = async (notebook: Notebook, note: string): Promise<Result<Note>> => {
    const notebookPath = [...notebook.notebooks, notebook.name]
    const { apiPath } = getNotePaths(notebookPath, note)

    try {
      const resp = await $fetch<Note>(`/api/note/${apiPath}`, {
        method: 'POST'
      })

      const nb = getNotebookByPathArray(notebookPath, notebooks.value)
      nb?.contents?.notes.push(resp)

      return {
        success: true,
        data: resp
      }
    } catch (error) {
      return { success: false, message: (error as FetchError).data.message }
    }
  }

  const addNotebook = async (notebook: Notebook, name: string): Promise<Result<Notebook>> => {
    const notebookPath = [...notebook.notebooks, notebook.name]
    const { apiPath } = getNotePaths(notebookPath, name)

    try {
      const resp = await $fetch<Notebook>(`/api/notebook/${apiPath}`, {
        method: 'POST'
      })

      const nb = getNotebookByPathArray(notebookPath, notebooks.value)
      if (nb?.contents?.notebooks) {
        nb.contents.notebooks[name] = resp
      }
      return {
        success: true,
        data: resp
      }
    } catch (error) {
      return { success: false, message: (error as FetchError).data.message }
    }
  }

  return {
    openNotebook,
    notebooks,
    status,
    renameNotebook,
    mainTopLevel,
    sidebarTopLevel,
    error,
    currentLevel,
    resetSidebarNotebook,
    deleteNotebook,
    addNotebook,
    // Note
    deleteNote,
    renameNote,
    addNote
  }
})
