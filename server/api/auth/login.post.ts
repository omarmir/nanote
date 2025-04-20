import jwt from 'jsonwebtoken'
import SECRET_KEY from '~/server/key'
import { defineEventHandlerWithError } from '~/server/wrappers/error'

export default defineEventHandlerWithError(async (event) => {
  const body = await readBody(event)
  const { key } = body

  // Example user authentication (replace with DB lookup)
  if (key !== SECRET_KEY) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Secret key does not match.'
    })
  }

  // Create JWT token
  const token = jwt.sign({ app: 'nanote' }, SECRET_KEY, { expiresIn: '7d' })

  setCookie(event, 'token', token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 3600 * 24 * 7, // 7 days
    path: '/'
  })

  return sendRedirect(event, '/', 303)
})
