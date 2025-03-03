import { defineStore } from 'pinia'
import type { Notebook, NotebookContents } from '~/types/notebook'
import type { Result } from '~/types/result'
import type { FetchError } from 'ofetch'

export const useNotebookStore = defineStore('notebook', () => {
  const topLevelNotebookPath: Ref<string[]> = ref([])
  const sidebarNotebookPath: Ref<string[]> = ref([])

  const openNotebook = async (notebook: Notebook, type: 'main' | 'sidebar'): Promise<Result<NotebookContents>> => {
    const path = notebookPathArrayJoiner(notebook)

    if (type === 'main') {
      topLevelNotebookPath.value = [...notebook.notebooks, notebook.name]
    } else {
      sidebarNotebookPath.value = [...notebook.notebooks, notebook.name]
    }

    try {
      const resp = await $fetch<NotebookContents>(`/api/notebook/${path}`)
      return {
        success: true,
        data: resp
      }
    } catch (error) {
      return {
        success: false,
        message: (error as FetchError).data.message
      }
    }
  }

  const resetSidebarNotebook = () => (sidebarNotebookPath.value = [])

  return {
    topLevelNotebookPath,
    openNotebook,
    sidebarNotebookPath,
    resetSidebarNotebook
  }
})
