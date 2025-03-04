import type { Notebook } from '~/types/notebook'

export const notebookPathArrayJoiner = (notebook: Notebook) =>
  [...notebook.notebooks.filter((path) => path !== ''), notebook.name].join('/')

export const notePathArrayJoiner = (notebooks: string[]) => notebooks.filter((path) => path !== '').join('/')

export const arraysEqual = (arr1: string[], arr2: string[]) =>
  arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index])
