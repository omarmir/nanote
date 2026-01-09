import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Database
const mockDb = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  from: vi.fn(),
  all: vi.fn(),
  values: vi.fn(),
  onConflictDoUpdate: vi.fn()
}))

// Chainable mocks - must be done after imported or inside test,
// OR simpler: make them return `this` or the object dynamically.
// With vi.hoisted, we can return the methods. But chaining requires them to return the object.
// We can set it up in beforeEach.

vi.mock('#server/utils/drizzle', () => ({
  db: mockDb,
  tables: { settings: { setting: {}, value: {} } }
}))

// Stub readBody for POST
vi.stubGlobal('readBody', vi.fn())

import getAllHandler from '#server/api/settings/all.get'
import postIndexHandler from '#server/api/settings/index.post'

describe('server/api/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock returns
    mockDb.select.mockReturnValue(mockDb)
    mockDb.from.mockReturnValue(mockDb)
    mockDb.all.mockResolvedValue([])

    mockDb.insert.mockReturnValue(mockDb)
    mockDb.values.mockReturnValue(mockDb)
    mockDb.onConflictDoUpdate.mockResolvedValue(undefined)
  })

  describe('all.get', () => {
    it('should return settings from db', async () => {
      const mockSettings = [{ setting: 'theme', value: 'dark' }]
      mockDb.all.mockResolvedValue(mockSettings)

      const result = await getAllHandler({} as any)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockSettings)
      expect(mockDb.select).toHaveBeenCalled()
    })
  })

  describe('index.post', () => {
    it('should upsert setting', async () => {
      const newSetting = { setting: 'theme', value: 'light' }
      vi.mocked(readBody).mockResolvedValue(newSetting)

      const result = await postIndexHandler({} as any)

      expect(result.success).toBe(true)
      expect(mockDb.insert).toHaveBeenCalled()
      expect(mockDb.values).toHaveBeenCalledWith(newSetting)
    })
  })
})
