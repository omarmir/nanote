import type { TreeItem } from '@nuxt/ui'
import * as v from 'valibot'

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
  isPlaceholder?: boolean
  disabled: boolean
  isMarkdown?: boolean
}

export type RenameTreeItem = {
  label: string
  path: string
  createdAt: string
  updatedAt: string | null
  pathArray: string[]
  apiPath: string
  isMarkdown?: boolean
}

export type NotebookTreeItemClient = NotebookTreeItem & {
  childrenLoaded?: boolean
  isOpen?: boolean
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

export type SavingState = 'pending' | 'saving' | 'success' | 'error' | 'idle'

export const LAZY_LOAD_PLACEHOLDER: NotebookTreeItem = {
  label: 'Loading...',
  isPlaceholder: true,
  path: '',
  createdAt: '',
  updatedAt: null,
  isNote: false,
  pathArray: [],
  apiPath: '',
  childrenLoaded: false,
  disabled: true
}

// Forbidden characters across Windows, Linux, and macOS
// Windows: < > : " / \ | ? *
// Also forbidden: leading/trailing spaces or periods, names ending with space
// Reserved names on Windows: CON, PRN, AUX, NUL, COM1-9, LPT1-9
// eslint-disable-next-line no-control-regex
const forbiddenChars = /[<>:"/\\|?*\x00-\x1f]/
const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i

export const NewFileFolderSchema = v.pipe(
  v.object({
    name: v.pipe(
      v.string(),
      v.trim(),
      v.nonEmpty('Notebook name is required'),
      v.maxLength(255, 'Name must be 255 characters or less'),
      v.check((name) => !forbiddenChars.test(name), 'Name contains invalid characters (< > : " / \\ | ? *)'),
      v.check((name) => !reservedNames.test(name), 'Name cannot be a reserved system name'),
      v.check((name) => !name.endsWith('.'), 'Name cannot end with a period'),
      v.check((name) => name === name.trim(), 'Name cannot have leading or trailing spaces')
    )
  })
)

export const NewFileSchema = v.object({
  ...NewFileFolderSchema.entries,
  isManual: v.boolean()
})
export type NewName = v.InferOutput<typeof NewFileFolderSchema>
export type NewNotebook = v.InferOutput<typeof NewFileFolderSchema>
export type NewNote = v.InferOutput<typeof NewFileSchema>
