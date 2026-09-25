import { nanoid } from 'nanoid'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || nanoid(32),
      maxAge: 60 * 60 * 24 * 30 // 30 days
    }
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/test-utils',
    '@nuxt/hints',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    'nuxt-codemirror',
    'nuxt-auth-utils',
    'nuxt-authorization'
  ],

  ssr: false,

  imports: {
    presets: [
      {
        from: 'material-file-icons',
        imports: ['getIcon']
      }
    ]
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  fonts: {
    families: [
      { name: 'JetBrains Mono', global: true },
      { name: 'Fira Code', global: true },
      { name: 'Public Sans', global: true },
      { name: 'Inter', global: true }
    ]
  },

  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'fr', name: 'Français', file: 'fr.json' },
      { code: 'zh-CN', name: '简体中文', file: 'zh-CN.json' }
    ],
    experimental: {
      localeDetector: 'localeDetector.ts'
    }
  },

  icon: {
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/icons'
      }
    ],
    provider: 'server',
    clientBundle: {
      scan: true
    }
  }
})
