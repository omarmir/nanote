import type { Notebook, NotebookContents } from '~/types/notebook'

export const notebookPathArrayJoiner = (notebook: Notebook) =>
  [...notebook.notebooks.filter((path) => path !== ''), notebook.name].join('/')

export const notePathArrayJoiner = (notebooks: string[]) => notebooks.filter((path) => path !== '').join('/')

export const arraysEqual = (arr1: string[], arr2: string[]) =>
  arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index])

export const getNotebookByPathArray = (path: string[], contents: NotebookContents | null): Notebook | undefined => {
  if (!contents) return undefined
  let currentContents = contents
  let notebook: Notebook | undefined

  for (let i = 0; i < path.length; i++) {
    // If there are no notebooks at this level, we can't continue
    if (!currentContents.notebooks) return undefined

    notebook = currentContents.notebooks[path[i]]
    if (!notebook) return undefined

    // If this isn't the last element, set up for the next level
    if (i < path.length - 1) {
      if (!notebook.contents) return undefined
      currentContents = notebook.contents
    }
  }

  return notebook
}
