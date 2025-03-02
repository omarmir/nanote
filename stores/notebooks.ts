import { defineStore } from 'pinia'
import type { Notebook } from '~/types/notebook'

export const useNotebookStore = defineStore('notebook', () => {
  const {
    data: notebook,
    refresh,
    status,
    error
  } = useFetch<Notebook>('/api/notebook', {
    immediate: true,
    lazy: false
  })

  return {
    notebook,
    refresh,
    status,
    error
  }
})
