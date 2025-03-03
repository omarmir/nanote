import { defineStore } from 'pinia'
import type { FetchError } from 'ofetch'
import type { Notebook, NotebookContents } from '~/types/notebook'

export const useNotebookStore = defineStore('notebook', () => {
  const {
    data: notebook,
    refresh,
    status,
    error
  } = useFetch<NotebookContents>('/api/notebook', {
    immediate: true,
    lazy: false
  })

  const getNotebookContents = async (notebook: Notebook) => {
    const pathArray: string[] = [...notebook.notebooks.filter((path) => path !== ''), notebook.name]
    const path = pathArray.join('/')
    try {
      const resp = await $fetch<NotebookContents>(`/api/notebook/${path}`)
      return { success: true, data: resp }
    } catch (error) {
      return { success: false, message: (error as FetchError).data.message }
    }
  }

  return {
    notebook,
    getNotebookContents,
    refresh,
    status,
    error
  }
})
