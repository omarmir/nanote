import type { TreeItem } from '@nuxt/ui'

export type Notebook = {
  name: string
  createdAt: string
  updatedAt: string | null
  noteCount: number
  notebookCount: number
  path: string
  pathArray: string[]
  apiPath: string
}

export type Note = {
  name: string
  createdAt: string
  updatedAt: string | null
  size?: number
  isMarkdown: boolean
  preview?: string
  pathArray: string[]
  apiPath: string
}

export type NotebookTreeItem = Omit<TreeItem, 'children'> & {
  label: string
  path: string
  children?: NotebookTreeItem[]
  createdAt: string
  updatedAt: string | null
  noteCount?: number
  notebookCount?: number
  isNote: boolean
  pathArray: string[]
  apiPath: string
}

export type NoteResponse = {
  notebook: string[]
  note: string
  path: string
  createdAt: string
  updatedAt: string
  size: number
  originalFilename: string
}

export type RenameNotebook = {
  oldName: string
  path: string
  newName: string
  createdAt: string
  updatedAt: string
  notebooks: string[]
}

export type RenameNote = {
  oldName: string
  newName: string
  notebook: string[]
  createdAt: string
  updatedAt: string
}

export type DeleteNote = {
  name: string
  timestamp: string
  notebook: string[]
  deleted: boolean
}

export type DeleteNotebook = {
  timestamp: string
  notebook: string[]
  deleted: boolean
}

export type SavingState = 'pending' | 'saving' | 'success' | 'error' | 'idle'

export type NotebookDisplay = 'main' | 'sidebar' | 'other'
