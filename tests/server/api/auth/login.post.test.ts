import { describe, it, expect, vi, beforeEach } from 'vitest'

import handler from '#server/api/auth/login.post'

// Mock dependencies
let mockSecretKey: string = 'nanote'
vi.mock('#server/utils/key', () => ({
  get default() {
    return mockSecretKey
  }
}))

// We need to mock readBody since it's an auto-import that wraps h3
vi.stubGlobal('readBody', vi.fn())
vi.stubGlobal('setUserSession', vi.fn())

describe('server/api/auth/login.post', () => {
  beforeEach(() => {
    mockSecretKey = 'correct-secret'
    vi.clearAllMocks()
  })

  it('should return true and set session for correct key', async () => {
    vi.mocked(readBody).mockResolvedValue({ secretKey: 'correct-secret' })

    const event = {} as any
    const result = await handler(event)

    expect(result).toBe(true)
    expect(setUserSession).toHaveBeenCalledWith(
      event,
      expect.objectContaining({
        user: { role: 'root' }
      })
    )
  })

  it('should throw 401 for incorrect key', async () => {
    vi.mocked(readBody).mockResolvedValue({ secretKey: 'wrong-secret' })

    const event = {} as any

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 401
    })

    expect(setUserSession).not.toHaveBeenCalled()
  })
})
