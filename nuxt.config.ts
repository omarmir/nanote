// https://nuxt.com/docs/api/configuration/nuxt-config
import { uploadPath } from './server/folder'
import { resolve } from 'node:path'
const persistentUploadPath = resolve(__dirname, 'uploads')

export default defineNuxtConfig({
  nitro: {
    storage: {
      content: {
        driver: 'fs',
        base: persistentUploadPath
      }
    }
  },
  compatibilityDate: '2024-11-01',
  ssr: false,
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxt/fonts',
    '@nuxt/eslint',
    '@nuxtjs/eslint-module',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/test-utils/module'
  ],
  fonts: {
    families: [
      // do not resolve this font with any provider from `@nuxt/fonts`
      { name: 'Rubik', provider: 'google', global: true },
      // only resolve this font with the `google` provider
      { name: 'Inter', provider: 'google', global: true },
      // specify specific font data - this will bypass any providers
      { name: 'JetBrains Mono', provider: 'google', global: true }
    ]
  },
  routeRules: {
    '/api/notebook': { redirect: '/api/notebook/*' }
  }
})
