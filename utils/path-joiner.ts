import type { Notebook, NotebookContents } from '~/types/notebook'

export const notebookPathArrayJoiner = (notebook: Notebook) =>
  [...notebook.notebooks.filter((path) => path !== ''), notebook.name].join('/')

export const notePathArrayJoiner = (notebooks: string[]) => notebooks.filter((path) => path !== '').join('/')

export const sameNotebook = (nb1?: Notebook | null, nb2?: Notebook | null) =>
  nb1 && nb2 && nb1.name === nb2.name && nb1.notebooks.every((val, idx) => val === nb2.notebooks[idx])

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
