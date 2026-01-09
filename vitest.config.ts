import { defineVitestConfig } from '@nuxt/test-utils/config'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    alias: {
      '#server': path.resolve(root, './server'),
      '#tests': path.resolve(root, './tests')
    }
  }
})
