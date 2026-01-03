import { defineAbility, deny } from 'nuxt-authorization/utils'
import type { UserSession } from '#auth-utils'

export const editAllNotes = defineAbility((session: UserSession) => {
  if (session.role === 'root') return true
  return deny({ statusCode: 403 })
})
