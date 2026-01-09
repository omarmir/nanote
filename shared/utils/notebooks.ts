import type { NotebookTreeItemClient } from '#shared/types/notebook'
import type { Result } from '#shared/types/result'

// Helper function to traverse the tree and find a notebook by its pathArray
export const findNotebookByPath = (
  pathArray: string[],
  notebooks: NotebookTreeItemClient[]
): NotebookTreeItemClient | null => {
  if (!notebooks) return null
  // If pathArray is empty, return the root-level notebook
  if (pathArray.length === 0) {
    return null // Root-level notebooks are handled differently
  }

  // Navigate through the tree using pathArray as the hierarchy
  let currentItems = notebooks
  let currentNotebook: NotebookTreeItemClient | null = null

  for (const pathSegment of pathArray) {
    currentNotebook = currentItems.find(item => item.label === pathSegment) || null
    if (!currentNotebook) {
      return null
    }
    // If not at the end, continue to children
    if (currentNotebook.children && pathArray.indexOf(pathSegment) < pathArray.length - 1) {
      currentItems = currentNotebook.children
    }
  }

  return currentNotebook
}

export const toggleNotebook = async (
  notebook: NotebookTreeItemClient,
  notebooks: NotebookTreeItemClient[]
): Promise<Result<null>> => {
  // If it's a note (not a notebook/folder), nothing to load
  if (notebook.isNote) {
    return { success: true, data: null }
  }

  // If children are already loaded, nothing to do
  if (notebook.childrenLoaded) {
    return { success: true, data: null }
  }

  try {
    // Fetch children from the API
    const children = await $fetch<NotebookTreeItemClient[]>(`/api/notebook/${notebook.apiPath}`)

    // Find the notebook in the tree using pathArray and add children
    const targetNotebook = findNotebookByPath(notebook.pathArray, notebooks)
    if (targetNotebook) {
      // Add children with childrenLoaded flag
      targetNotebook.children = children.map(child => ({
        ...child,
        childrenLoaded: false
      }))
      targetNotebook.childrenLoaded = true
    } else if (notebook.pathArray.length === 0) {
      // Handle root-level notebooks
      notebook.children = children.map(child => ({
        ...child,
        childrenLoaded: false
      }))
      notebook.childrenLoaded = true
    }
    return { success: true, data: null }
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Failed to load notebook children'
    }
  }
}

export const removeSequentialMatch = (prefix: string[], target: string[]) => {
  // Check if every element in the prefix matches the target in order
  const matches = prefix.every((val, index) => val === target[index])

  // If match is true, return the target starting after the prefix length
  return matches ? target.slice(prefix.length) : target
}
