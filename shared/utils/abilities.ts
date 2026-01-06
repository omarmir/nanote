import { defineAbility, deny } from 'nuxt-authorization/utils'
import type { UserSession } from '#auth-utils'

export const editAllNotes = defineAbility((session: UserSession) => {
  if (session.user?.role === 'root') return true
  return deny({ statusCode: 401 })
})

export const getAttachments = defineAbility((session: UserSession, internalHeader?: string, internalKey?: string) => {
  if (session.user?.role === 'root') return true

  if (!internalHeader || internalKey) return deny({ statusCode: 401 })

  if (internalHeader === internalKey) return true

  return deny({ statusCode: 401 })
})
