import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    include: ['./tests/**/*.test.ts', './tests/**/*.spec.ts'],
    setupFiles: ['tests/setup.ts']
  }
})
