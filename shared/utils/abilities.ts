import { defineAbility, deny } from 'nuxt-authorization/utils'
import type { UserSession } from '#auth-utils'

export const editAllNotes = defineAbility((session: UserSession) => {
  if (session.user?.role === 'root') return true
  return deny({ statusCode: 401 })
})

export const viewSharedNote = defineAbility((session: UserSession, apiPath: string) => {
  if (session.user?.role === 'root') return true

  if (session.user?.role === 'shared') {
    // @ts-expect-error share is secure and can only be validated from a server side call
    if (session.secure?.share?.apiPath === apiPath) return true
  }

  return deny({ statusCode: 401 })
})

export const viewAttachment = defineAbility(
  (
    session: UserSession,
    fileName: string,
    options?: { validToken: boolean } | { shared: { attachments?: string[]; apiPath?: string } }
  ) => {
    // If its the root user - pass
    if (session.user?.role === 'root') return true

    // no additional data passed -fail
    if (!options) return deny({ statusCode: 401 })

    // valid token was passed to route - pass
    if ('validToken' in options && options.validToken) return true

    // The session is not shared - fail
    if (session.user?.role !== 'shared') return deny({ statusCode: 401 })

    // Its a shared note and no shared options sent - fail
    if ('shared' in options === false) return deny({ statusCode: 401 })

    // Note path not provided or attachment list not provided - fail
    if (!options.shared.apiPath || !options.shared.attachments) return deny({ statusCode: 401 })

    // Its a shared note and note they have access to is valid for the user
    // @ts-expect-error share is secure and can only be validated from a server side call
    if (session.secure?.share?.apiPath !== options.shared.apiPath) return deny({ statusCode: 401 })

    // Its a shared note and the valid attachments includes the attachment in question - pass
    if (options.shared.attachments.includes(fileName)) return true

    return deny({ statusCode: 401 })
  }
)
