import { access, constants, rename, stat } from 'node:fs/promises'
import { join, resolve, basename } from 'node:path'
import { notesPath } from '~/server/folder'
import { defineEventHandlerWithError } from '../wrappers/error'
import type { Result } from '~/types/result'
import { readBody, createError } from 'h3'
import type { Note, Notebook } from '~/types/notebook'

type MoveRequest = {
  source: Note | Notebook
  destination: { path: string }
}

// Type guard to check if source is a Notebook
function isNotebook(obj: Note | Notebook): obj is Notebook {
  return (obj as Notebook).path !== undefined
}

export default defineEventHandlerWithError(async (event): Promise<Result<boolean>> => {
  const body = await readBody<MoveRequest>(event)
  if (!body?.source || !body?.destination?.path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Missing source or destination information.'
    })
  }

  // Determine source type and path
  let sourcePath: string
  let isSourceNotebook: boolean

  if (isNotebook(body.source)) {
    sourcePath = resolve(notesPath, ...body.source.path.split('/').filter(Boolean))
    isSourceNotebook = true
  } else {
    // For notes, reconstruct path from notebook array and note name
    if (!body.source.notebook?.length || !body.source.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Note source missing notebook or name.'
      })
    }
    sourcePath = resolve(notesPath, ...body.source.notebook, body.source.name)
    isSourceNotebook = false
  }

  const destinationPath = resolve(notesPath, ...body.destination.path.split('/').filter(Boolean))

  // Validate source and destination are within notesPath
  if (!sourcePath.startsWith(resolve(notesPath)) || !destinationPath.startsWith(resolve(notesPath))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid source or destination path.'
    })
  }

  // Confirm source exists and is correct type
  let sourceStats
  try {
    sourceStats = await stat(sourcePath)
    if (!isSourceNotebook && !sourceStats.isFile()) {
      throw new Error('Source is not a file.')
    }
    if (isSourceNotebook && !sourceStats.isDirectory()) {
      throw new Error('Source is not a directory.')
    }
  } catch {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Source does not exist or is not accessible.'
    })
  }

  // Confirm destination exists and is a directory
  let destStats
  try {
    destStats = await stat(destinationPath)
    if (!destStats.isDirectory()) {
      throw new Error('Destination is not a directory.')
    }
  } catch {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Destination does not exist or is not accessible.'
    })
  }

  // Permissions check
  try {
    await access(sourcePath, constants.R_OK | constants.W_OK)
    await access(destinationPath, constants.R_OK | constants.W_OK)
  } catch {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Insufficient permissions on source or destination.'
    })
  }

  // Prevent moving into itself or same location
  if (isSourceNotebook) {
    // Prevent moving a folder into itself or its subfolder
    if (sourcePath === destinationPath || destinationPath.startsWith(sourcePath + '/')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Cannot move a notebook into itself or its subfolder.'
      })
    }
  } else {
    // Prevent moving a note into its own parent
    const sourceParent = resolve(sourcePath, '..')
    if (sourceParent === destinationPath) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Note is already in the destination notebook.'
      })
    }
  }

  // Compute new path
  const newPath = join(destinationPath, basename(sourcePath))

  // Prevent overwrite
  try {
    await access(newPath, constants.F_OK)
    throw createError({
      statusCode: 409,
      statusMessage: 'Conflict',
      message: 'A file or notebook with the same name already exists in the destination.'
    })
  } catch (error) {
    // File doesn't exist, fine to move
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }

  // Move operation
  await rename(sourcePath, newPath)

  return {
    success: true,
    data: true
  }
})
