export default defineNuxtRouteMiddleware((to, _from) => {
  if (to.name !== 'share-key' && to.name !== 'login') {
    const isLoggedId = localStorage.getItem('isLoggedIn')
    if (isLoggedId !== 'true') {
      return navigateTo('/login')
    }
  }
})
