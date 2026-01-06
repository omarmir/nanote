import { defineAbility, deny } from 'nuxt-authorization/utils'
import type { UserSession } from '#auth-utils'

export const editAllNotes = defineAbility((session: UserSession) => {
  if (session.user?.role === 'root') return true
  return deny({ statusCode: 401 })
})

export const getPDFAttachments = defineAbility((session: UserSession, validToken?: boolean) => {
  if (session.user?.role === 'root') return true

  if (validToken === true) return true

  return deny({ statusCode: 401 })
})
