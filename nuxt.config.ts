// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/test-utils',
    '@nuxt/hints',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    'nuxt-codemirror'
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

  i18n: {
    defaultLocale: 'en',
    locales: [{ code: 'en', name: 'English', file: 'en.json' }],
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
