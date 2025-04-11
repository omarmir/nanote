import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    setupFiles: './tests/setup.ts'
  }
})
