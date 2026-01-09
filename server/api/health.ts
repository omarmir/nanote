import { envNotesPath, envUploadsPath, envConfigPath } from '~~/server/folder'
import { defineEventHandlerWithError } from '../wrappers/error'
import SECRET_KEY from '~~/server/utils/key'

// eslint-disable-next-line local/require-authorize
export default defineEventHandlerWithError(async (event): Promise<Health> => {
  const session = await getUserSession(event)

  if (session.user?.role !== 'root') {
    return {
      status: 'OK',
      warnings: []
    }
  }

  const warnings = []

  const t = await useTranslation(event)

  if (SECRET_KEY === 'nanote') warnings.push(t('health.warnings.secretKey'))
  if (!envNotesPath) if (!envNotesPath) warnings.push(t('health.warnings.storageLocation'))
  if (!envUploadsPath) if (!envUploadsPath) warnings.push(t('health.warnings.uploadsLocation'))
  if (!envConfigPath) warnings.push(t('health.warnings.configPath'))

  return {
    status: warnings.length > 0 ? 'Warnings' : 'OK',
    warnings
  }
})
