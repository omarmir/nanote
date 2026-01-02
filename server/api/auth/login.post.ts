import SECRET_KEY from '~~/server/utils/key'

export default defineEventHandler(async (event): Promise<boolean> => {
  const { secretKey } = await readBody(event)
  const t = await useTranslation(event)

  const isValid = secretKey === SECRET_KEY

  console.log(secretKey)
  console.log(SECRET_KEY)

  if (!isValid) {
    throw createError({
      statusCode: 401,
      message: t('errors.wrongKey')
    })
  }

  // 3. Set the session
  await setUserSession(event, {
    user: {
      role: 'authenticated'
    },
    loggedInAt: new Date()
  })

  return true
})
