import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
describe('Health check', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('..', import.meta.url)),
    server: true
  })

  it('Response expected health check', async () => {
    const response = await $fetch('/api/health')
    const resp = {
      status: 'OK',
      message: 'Service is running',
      warnings: [
        'Secret key should be changed from the default.',
        'Storage location is not set, this could result in loss of notes.',
        'Uploads location is not set, this could result in loss of uploads.',
        'Config location is not set, this could result in loss of settings and shared notes.'
      ]
    }

    expect(response).toEqual(expect.objectContaining(resp))
  })
})
