import { describe, it, expect, vi, beforeEach } from 'vitest'

// We need to mock the dependencies BEFORE importing the handler
// because they are top-level imports in the handler file.

// Variables to control the mock values
let mockEnvNotesPath: string | undefined
let mockEnvUploadsPath: string | undefined
let mockEnvConfigPath: string | undefined
let mockSecretKey: string = 'nanote'

vi.mock('#server/folder', () => ({
  get envNotesPath() {
    return mockEnvNotesPath
  },
  get envUploadsPath() {
    return mockEnvUploadsPath
  },
  get envConfigPath() {
    return mockEnvConfigPath
  }
}))

vi.mock('#server/utils/key', () => ({
  get default() {
    return mockSecretKey
  }
}))

import handler from '#server/api/health'

describe('server/api/health', () => {
  beforeEach(() => {
    // Reset defaults
    mockEnvNotesPath = '/tmp/notes'
    mockEnvUploadsPath = '/tmp/uploads'
    mockEnvConfigPath = '/tmp/config'
    mockSecretKey = 'some-secure-key'
    vi.clearAllMocks()
    vi.mocked(getUserSession).mockResolvedValue({ user: { role: 'root' } })
  })

  it('should return OK when everything is configured', async () => {
    const event = {} as any
    const result = await handler(event)
    expect(result.status).toBe('OK')
    expect(result.warnings).toHaveLength(0)
  })

  it('should warn if folders are missing', async () => {
    mockEnvNotesPath = undefined

    // We mock useTranslation in setup.ts to return the key
    const event = {} as any
    const result = await handler(event)

    expect(result.status).toBe('Warnings')
    expect(result.warnings).toContain('health.warnings.storageLocation')
  })

  it('should warn if secret key is default "nanote"', async () => {
    mockSecretKey = 'nanote'

    const event = {} as any
    const result = await handler(event)

    expect(result.status).toBe('Warnings')
    expect(result.warnings).toContain('health.warnings.secretKey')
  })

  it('should return OK (hidden details) if not root', async () => {
    vi.mocked(getUserSession).mockResolvedValue({ user: { role: 'user' } })
    mockEnvNotesPath = undefined // Should have warnings if checking

    const event = {} as any
    const result = await handler(event)

    // Should return OK and no warnings because user is not root
    expect(result.status).toBe('OK')
    expect(result.warnings).toHaveLength(0)
  })
})
