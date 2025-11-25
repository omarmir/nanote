import { checkLogin } from '../utils'

export default defineEventHandler((event) => {
  return // bypass for dev
  // if (
  //   !event.path.startsWith('/api/') ||
  //   event.path === '/api/auth/login' ||
  //   event.path === '/api/health' ||
  //   event.path.startsWith('/api/share') ||
  //   event.path.startsWith('/api/attachment/') // Attachment has its own auth logic
  // )
  //   return

  // const cookie = getCookie(event, 'token')

  // const verifyResult = checkLogin(cookie)

  // if (!verifyResult.success)
  //   throw createError({
  //     statusCode: 401,
  //     statusMessage: 'Unauthorized',
  //     message: verifyResult.message
  //   })
})
