import jwt from 'jsonwebtoken'
import SECRET_KEY from '~/server/key'

export default defineEventHandler((event) => {
  // return // bypass for dev
  if (
    !event.path.startsWith('/api/') ||
    event.path === '/api/auth/login' ||
    event.path === '/api/health' ||
    event.path.startsWith('/api/share')
  )
    return

  const cookie = getCookie(event, 'token')

  if (!cookie) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Please login first'
    })
  }

  try {
    jwt.verify(cookie, SECRET_KEY)
  } catch (err) {
    console.log(err)
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Unable to verify authentication.'
    })
  }
})
