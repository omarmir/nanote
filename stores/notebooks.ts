import { defineStore } from 'pinia'
import type { Notebook, NotebookContents, RenameNotebook } from '~/types/notebook'
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

  const openNotebook = async (notebook: Notebook, type: 'main' | 'sidebar'): Promise<Result<NotebookContents>> => {
    const apiPath = notebookPathArrayJoiner(notebook)
    const notebookPath = [...notebook.notebooks, notebook.name]
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
    const apiPath = notebookPathArrayJoiner(notebook)
    const notebookPath = [...notebook.notebooks, notebook.name]
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

  const currentLevel = (notebook: Notebook, type: 'main' | 'sidebar'): boolean => {
    const notebookPath = [...notebook.notebooks, notebook.name]
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

  return {
    openNotebook,
    notebooks,
    status,
    renameNotebook,
    mainTopLevel,
    sidebarTopLevel,
    error,
    currentLevel,
    resetSidebarNotebook
  }
})
