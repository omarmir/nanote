// https://nuxt.com/docs/api/configuration/nuxt-config
import { join } from 'node:path'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  runtimeConfig: {
    NOTES_PATH: process.env.NOTES_PATH || join(process.cwd(), 'notes')
  },
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
