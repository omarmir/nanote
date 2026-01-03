// Detect based on query, cookie, header
export default defineI18nLocaleDetector((event, config) => {
  // try to get locale from query

  const runtimeConfig = useRuntimeConfig()

  // Depending on your i18n version, it's usually under runtimeConfig.public.i18n
  // but we can also check the local config as a backup.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const i18nOptions = (runtimeConfig.public?.i18n || config) as any

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supportedLocales: string[] = i18nOptions.locales.map((l: any) => (typeof l === 'string' ? l : l.code))

  const detect = () => {
    const query = tryQueryLocale(event, { lang: '' })
    if (query) return query.toString()

    const cookie = tryCookieLocale(event, { lang: '', name: 'i18n_preference' })
    if (cookie) return cookie.toString()

    const cookieRedirect = tryCookieLocale(event, { lang: '', name: 'i18n_redirected' }) // disable locale default value with `lang` option
    if (cookieRedirect) return cookieRedirect.toString()

    const header = tryHeaderLocale(event, { lang: '' })
    if (header) return header.toString()

    return config.defaultLocale
  }

  const detected = detect()

  // 2. Logic to handle "en-GB" -> "en" or fallback
  // If it's something like 'en-GB', we take the first part 'en'
  const baseLocale = detected.split('-')[0]

  if (supportedLocales.includes(detected)) {
    return detected
  } else if (baseLocale && supportedLocales.includes(baseLocale)) {
    return baseLocale
  }

  // If the locale cannot be resolved up to this point, it is resolved with the value `defaultLocale` of the locale config passed to the function
  return i18nOptions.defaultLocale
})
