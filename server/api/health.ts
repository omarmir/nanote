import SECRET_KEY from '~/server/key'
import { envNotesPath, envUploadsPath, envConfigPath } from '~/server/folder'
import { defineEventHandlerWithError } from '../wrappers/error'

type Health = {
  status: 'OK'
  message: 'Service is running'
  warnings: string[]
}

export default defineEventHandlerWithError(async (_event): Promise<Health> => {
  const warnings = []

  if (SECRET_KEY === 'nanote') warnings.push('Secret key should be changed from the default.')
  if (!envNotesPath)
    if (!envNotesPath) warnings.push('Storage location is not set, this could result in loss of notes.')
  if (!envUploadsPath)
    if (!envUploadsPath) warnings.push('Uploads location is not set, this could result in loss of uploads.')

  if (!envConfigPath)
    warnings.push('Config location is not set, this could result in loss of settings and shared notes.')

  return {
    status: 'OK',
    message: 'Service is running',
    warnings
  }
})
