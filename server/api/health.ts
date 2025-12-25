import SECRET_KEY from '~~/server/key'
import { envNotesPath, envUploadsPath, envConfigPath } from '~~/server/folder'
import { defineEventHandlerWithError } from '../wrappers/error'

type Health = {
  status: 'OK' | 'Warnings'
  warnings: string[]
}

export default defineEventHandlerWithError(async (event): Promise<Health> => {
  const warnings = []

  const t = await useTranslation(event)

  if (SECRET_KEY === 'nanote') warnings.push(t('health.warnings.secretKey'))
  if (!envNotesPath) if (!envNotesPath) warnings.push(t('health.warnings.storageLocation'))
  if (!envUploadsPath) if (!envUploadsPath) warnings.push(t('health.warnings.uploadsLocation'))
  if (!envConfigPath) warnings.push(t('health.warnings.configPath'))

  return {
    status: 'OK',
    warnings
  }
})
