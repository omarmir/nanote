import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to, _from) => {
  if (to.name !== 'share-key' && to.name !== 'login') {
    const store = useAuthStore()
    const isLoggedIn = await store.checkAuth()
    if (!isLoggedIn) {
      return navigateTo('/login')
    }
  }
})
