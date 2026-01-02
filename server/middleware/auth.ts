// server/middleware/auth.ts
export default defineEventHandler(async event => {
  const { path } = event

  // 1. Immediate whitelist check (No async calls before this!)
  const isPublicApi =
    !path.startsWith('/api/') ||
    path.startsWith('/api/_auth/') ||
    path === '/api/auth/login' ||
    path === '/api/health' ||
    path.startsWith('/api/share') ||
    path.startsWith('/api/attachment/') ||
    path.startsWith('/api/_nuxt_icon/')

  if (isPublicApi) return

  // 2. Check session
  const session = await getUserSession(event)

  if (!session.user) {
    // 3. ONLY call translation/extra logic if we are actually throwing an error
    const t = await useTranslation(event)
    throw createError({
      statusCode: 401,
      message: t('errors.authRequired')
    })
  }
})
