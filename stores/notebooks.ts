import { defineStore } from 'pinia'
import type { Notebook, NotebookContents, RenameNotebook } from '~/types/notebook'
import type { Result } from '~/types/result'
import type { FetchError } from 'ofetch'

export const useNotebookStore = defineStore('notebook', () => {
  const topLevelNotebookPath: Ref<string[]> = ref([])
  const sidebarNotebookPath: Ref<string[]> = ref([])
  const renameNotebookPath: Ref<{ oldPath: string[]; rename: RenameNotebook } | null> = ref(null)

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

  const renameNotebook = async (notebook: Notebook, newNotebookName: string): Promise<Result<RenameNotebook>> => {
    const path = notebookPathArrayJoiner(notebook)
    try {
      const resp = await $fetch<RenameNotebook>(`/api/notebook/${path}`, {
        method: 'PUT',
        body: {
          newName: newNotebookName
        }
      })
      renameNotebookPath.value = { oldPath: [...notebook.notebooks, notebook.name], rename: resp }
      return { success: true, data: resp }
    } catch (err) {
      const error = (err as FetchError).data.message
      return { success: false, message: error }
    }
  }

  return {
    topLevelNotebookPath,
    openNotebook,
    sidebarNotebookPath,
    resetSidebarNotebook,
    renameNotebook,
    renameNotebookPath
  }
})
