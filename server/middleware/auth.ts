// server/middleware/auth.ts
export default defineEventHandler(async event => {
  const { path } = event
  const t = await useTranslation(event)

  // 1. Define public paths (whitelist)
  const isPublicApi =
    !path.startsWith('/api/') ||
    path === '/api/auth/login' ||
    path === '/api/health' ||
    path.startsWith('/api/share') ||
    path.startsWith('/api/attachment/')

  if (isPublicApi) return

  // 2. Check for the session
  // getUserSession handles the decryption and cookie parsing for you
  const session = await getUserSession(event)

  // 3. If no user object exists in the session, they aren't logged in
  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: t('errors.authRequired')
    })
  }
})
