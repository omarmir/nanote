import type { UserSession } from '#auth-utils'

export default defineNuxtPlugin({
  name: 'authorization-resolver',
  parallel: true,
  setup() {
    return {
      provide: {
        authorization: {
          resolveClientUser: (): UserSession | null => {
            const { session } = useUserSession()
            return session.value ?? null
          }
        }
      }
    }
  }
})
