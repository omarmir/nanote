// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  nitro: {
    hooks: {
      'build:before': async (nitro) => {
        // Copy necessary files to the server output directory
        const fs = await import('node:fs/promises')
        const path = await import('node:path')
        const srcAssets = path.resolve('node_modules/mdpdf/dist/src/assets')
        const srcLayouts = path.resolve('node_modules/mdpdf/dist/src/layouts')

        const destAssets = path.resolve(
          nitro.options.output.serverDir,
          'node_modules',
          'mdpdf',
          'dist',
          'src',
          'assets'
        )
        const destLayouts = path.resolve(
          nitro.options.output.serverDir,
          'node_modules',
          'mdpdf',
          'dist',
          'src',
          'layouts'
        )
        await fs.cp(srcAssets, destAssets, { recursive: true })
        await fs.cp(srcLayouts, destLayouts, { recursive: true })
      }
    }
  },
  app: {
    head: {
      title: 'Nanote', // default fallback title
      htmlAttrs: {
        lang: 'en'
      },
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    }
  },
  compatibilityDate: '2024-11-01',
  ssr: false,
  devtools: {
    enabled: true,
    timeline: {
      enabled: true
    }
  },
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxt/fonts',
    '@nuxt/eslint',
    '@nuxtjs/eslint-module',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/test-utils/module',
    '@nuxt/icon',
    'nuxt-codemirror'
  ],
  tailwindcss: {
    config: {
      content: {
        files: ['./components/**/*.{vue,js,ts}', './layouts/**/*.vue', './pages/**/*.vue', '!./node_modules']
      }
    }
  },
  icon: {
    size: '20px',
    class: 'icon',
    mode: 'svg',
    cssLayer: 'base',
    clientBundle: {
      scan: true
    }
  },
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
  },
  vite: {
    server: {
      watch: {
        usePolling: false // on Linux/macOS you usually don’t need polling
      }
    },
    optimizeDeps: {
      // pre-bundle common deps so they’re not re-scanned each time
      include: ['vue', 'vue-router', 'pinia']
    }
  }
})
