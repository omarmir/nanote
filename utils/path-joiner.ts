import type { Note, Notebook, NotebookContents } from '~/types/notebook'

export const notebookPathArrayJoiner = (notebook: Notebook) =>
  [...notebook.notebooks.filter((path) => path !== ''), notebook.name].join('/')

export const notePathArrayJoiner = (notebooks: string[]) => notebooks.filter((path) => path !== '').join('/')

export const sameNotebook = (nb1?: Notebook | null, nb2?: Notebook | null): boolean => {
  if (!nb1 || !nb2) return false

  // Check if same notebook
  if (
    nb1.name === nb2.name &&
    nb1.notebooks.length === nb2.notebooks.length &&
    nb1.notebooks.every((val, idx) => val === nb2.notebooks[idx])
  ) {
    return true
  }

  // Check if nb2 is a descendant of nb1
  if (
    nb2.notebooks.length >= nb1.notebooks.length + 1 &&
    nb1.notebooks.every((val, idx) => val === nb2.notebooks[idx]) &&
    nb2.notebooks[nb1.notebooks.length] === nb1.name
  ) {
    return true
  }

  return false
}

export const noteInSameNotebook = (note: Note, notebook: Notebook) =>
  [...notebook.notebooks, notebook.name].every((val, idx) => val === notebook.notebooks[idx])

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
