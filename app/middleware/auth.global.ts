// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async to => {
  // 0. Bypass for shared notes
  if (to.path.startsWith('/share/')) return

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

  if (notebookStore.recentStatus === 'idle') {
    initTasks.push(notebookStore.refreshRecentNotes())
  }

  // Run them in parallel to save time
  if (initTasks.length > 0) {
    await Promise.all(initTasks)
  }
})
