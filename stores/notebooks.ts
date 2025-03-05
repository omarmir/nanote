import { defineStore } from 'pinia'
import type { Notebook, NotebookContents, RenameNotebook } from '~/types/notebook'
import type { Result } from '~/types/result'
import type { FetchError } from 'ofetch'

export const useNotebookStore = defineStore('notebook', () => {
  const { data: notebooks, status } = useFetch<NotebookContents>('/api/notebook', {
    immediate: true,
    lazy: false
  })

  const openNotebook = async (notebook: Notebook, type: 'main' | 'sidebar') => {
    const apiPath = notebookPathArrayJoiner(notebook)
    try {
      const resp = await $fetch<NotebookContents>(`/api/notebook/${apiPath}`)
      const nb = getNotebookByPathArray(notebook.notebooks, notebooks.value)
      if (nb) {
        nb.contents = resp
      } else {
        notebooks.value = resp
      }
    } catch (error) {
      console.log(error)
    }
  }

  const renameNotebook = async (notebook: Notebook, newNotebookName: string): Promise<Result<RenameNotebook>> => {
    const apiPath = notebookPathArrayJoiner(notebook)
    try {
      const resp = await $fetch<RenameNotebook>(`/api/notebook/${apiPath}`, {
        method: 'PUT',
        body: {
          newName: newNotebookName
        }
      })
      return { success: true, data: resp }
    } catch (err) {
      const error = (err as FetchError).data.message
      return { success: false, message: error }
    }
  }

  return {
    openNotebook,
    notebooks,
    status,
    renameNotebook
  }
})
