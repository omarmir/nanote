import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createTestContext } from '#tests/utils/fs-utils'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

import postHandler from '#server/api/share/[...path].post'
import getHandler from '#server/api/share/[key].get'
import deleteHandler from '#server/api/share/[key].delete'

let testContext: ReturnType<typeof createTestContext>

vi.mock('#server/folder', () => {
  return {
    get notesPath() {
      return testContext?.notesDir
    },
    get uploadPath() {
      return testContext?.uploadsDir
    }
  }
})

// Mock DB
const mockDb = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  delete: vi.fn(),
  from: vi.fn(),
  all: vi.fn(),
  get: vi.fn(),
  values: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
  returning: vi.fn(),
  query: {
    shared: {
      findFirst: vi.fn()
    }
  }
}))

// Chainable mocks set up in beforeEach or via returning object here.
// But hoisting means we can't reference hoisted variable in itself easily if we use factory.
// We'll set returns in beforeEach, or just use `vi.fn().mockReturnThis()` doesn't work well if called before init?
// vi.hoisted returns the object immediately.

// We will config chains in setup/beforeEach.

vi.mock('#server/utils/drizzle', () => ({
  db: mockDb,
  tables: { shared: { id: {}, key: {}, path: {} } },
  eq: vi.fn().mockReturnValue({}),
  and: vi.fn().mockReturnValue({})
}))
vi.stubGlobal('db', mockDb)
vi.stubGlobal('eq', vi.fn().mockReturnValue({}))

// Mock nanoid
vi.mock('nanoid', () => ({
  nanoid: () => 'test-id'
}))

// Stub readBody
vi.stubGlobal('readBody', vi.fn())

// Stub useStorage
vi.stubGlobal('useStorage', () => ({
  setItem: vi.fn(),
  removeItem: vi.fn(),
  hasItem: vi.fn().mockResolvedValue([])
}))
vi.stubGlobal('SHARED_ATTACHMENT_PREFIX', 'shared:')

// Stub send (h3)
vi.stubGlobal(
  'send',
  vi.fn().mockImplementation((event, content) => content)
)
vi.stubGlobal('appendHeaders', vi.fn())

describe('server/api/share', () => {
  beforeEach(() => {
    testContext = createTestContext()
    vi.clearAllMocks()
    mockDb.select.mockReturnValue(mockDb)
    mockDb.from.mockReturnValue(mockDb)
    mockDb.where.mockReturnValue(mockDb)
    mockDb.delete.mockReturnValue(mockDb)
    mockDb.returning.mockReturnValue([{ notePath: 'folder/note.md' }])
    // Resolves
    mockDb.get.mockResolvedValue(null)
    mockDb.all.mockResolvedValue([])
    mockDb.insert.mockReturnValue(mockDb)
    mockDb.values.mockReturnValue(mockDb)

    // Create folder structure for tests
    mkdirSync(join(testContext.notesDir, 'folder'), { recursive: true })
    writeFileSync(join(testContext.notesDir, 'folder/note.md'), 'content')
  })

  afterEach(() => {
    testContext.cleanup()
  })

  describe('post (create share)', () => {
    it('should create a share link', async () => {
      vi.mocked(readBody).mockResolvedValue({ name: 'public' })

      const event = {
        context: { params: { path: 'folder/note.md' } }
      } as any

      const result = await postHandler(event)

      expect(mockDb.insert).toHaveBeenCalled()
      expect(result.success).toBe(true)
    })
  })

  describe('get (retrieve share)', () => {
    it('should return shared item', async () => {
      const mockShare = { id: 1, key: 'mykey', path: 'folder/note.md' }
      mockDb.query.shared.findFirst.mockResolvedValue(mockShare)

      const event = {
        context: { params: { key: 'mykey' } }
      } as any

      // We need to allow authorize access
      // authorize is global stub returning true.

      const result = await getHandler(event)

      // Expected to return content stream/string
      expect(result).toBe('content')
      expect(mockDb.query.shared.findFirst).toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('should delete share', async () => {
      const event = {
        context: { params: { key: 'mykey' } }
      } as any

      await deleteHandler(event)

      expect(mockDb.delete).toHaveBeenCalled()
      expect(mockDb.where).toHaveBeenCalled()
    })
  })
})
