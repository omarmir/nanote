import type { UserSession, User } from '#auth-utils'

export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('request', async event => {
    event.context.$authorization = {
      resolveServerUser: async (): Promise<UserSession | null> => {
        const session = await getUserSession(event)
        return session ?? null
      }
    }
  })
})
