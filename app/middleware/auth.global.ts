// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async to => {
  const { loggedIn } = useUserSession()

  // 1. Auth Guard
  if (!loggedIn.value) {
    if (to.path !== '/login') return navigateTo('/login')
    return
  }

  if (loggedIn.value && to.path === '/login') {
    return navigateTo('/')
  }

  // 2. Initialize Stores
  const settingsStore = useSettingsStore()
  const notebookStore = useNotebookStore()

  // Fix: added .value to status
  const initTasks = []

  if (!settingsStore.isLoaded) {
    initTasks.push(settingsStore.loadSettings())
  }

  if (notebookStore.status === 'idle') {
    initTasks.push(notebookStore.fetchBooks())
  }

  // Run them in parallel to save time
  if (initTasks.length > 0) {
    await Promise.all(initTasks)
  }
})
