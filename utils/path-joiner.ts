import type { Notebook } from '~/types/notebook'

export const notebookPathArrayJoiner = (notebook: Notebook) =>
  [...notebook.notebooks.filter((path) => path !== ''), notebook.name].join('/')

export const notePathArrayJoiner = (notebooks: string[]) => notebooks.filter((path) => path !== '').join('/')
