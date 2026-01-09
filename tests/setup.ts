import { vi } from 'vitest'

// Mock auto-imported utils
vi.stubGlobal('authorize', vi.fn().mockResolvedValue(true))
vi.stubGlobal('editAllNotes', 'editAllNotes')

// Stub Nitro/Nuxt globals
vi.stubGlobal('defineEventHandler', (fn: any) => fn)
vi.stubGlobal('useTranslation', () => (key: string) => key)
vi.stubGlobal('createError', (input: any) => {
  const err = new Error(input.message || input.statusMessage || 'Error')
  Object.assign(err, input)
  return err
})
vi.stubGlobal('getQuery', (event: any) => {
  // Basic mock extracting from URL query params
  if (event.path && event.path.includes('?')) {
    const queryParams = new URLSearchParams(event.path.split('?')[1])
    return Object.fromEntries(queryParams.entries())
  }
  return {}
})
vi.stubGlobal('getUserSession', vi.fn().mockResolvedValue({ user: { role: 'root' } }))
// Drizzle Utils Mocks
const sqlObj = { toSQL: () => '' }
vi.stubGlobal('eq', vi.fn().mockReturnValue(sqlObj))
vi.stubGlobal('and', vi.fn().mockReturnValue(sqlObj))
vi.stubGlobal('or', vi.fn().mockReturnValue(sqlObj))
vi.stubGlobal('asc', vi.fn().mockReturnValue(sqlObj))
vi.stubGlobal('desc', vi.fn().mockReturnValue(sqlObj))

// H3 / Nuxt Utils
vi.stubGlobal('setHeaders', vi.fn())
vi.stubGlobal('appendHeaders', vi.fn())
vi.stubGlobal(
  'sendStream',
  vi.fn().mockImplementation((event, stream) => stream)
)
vi.stubGlobal(
  'send',
  vi.fn().mockImplementation((event, content) => content)
)
vi.stubGlobal('readBody', vi.fn())
vi.stubGlobal('readMultipartFormData', vi.fn())
vi.stubGlobal('getRequestHeader', vi.fn())

// Nuxt Storage
vi.stubGlobal('useStorage', () => ({
  setItem: vi.fn(),
  removeItem: vi.fn(),
  hasItem: vi.fn().mockResolvedValue([])
}))

// Constants
vi.stubGlobal('SHARED_ATTACHMENT_PREFIX', 'shared:')

// Auto-imports from server/utils
vi.stubGlobal('fullRegex', /(?<=\(<|\()\/api\/attachment\/.*?(?=[)>])|(?<=href=")\/api\/attachment\/.*?(?=")/g)

// Mock h3
vi.mock('h3', async importOriginal => {
  const actual = await importOriginal<typeof import('h3')>()
  return {
    ...actual,
    readMultipartFormData: vi.fn(),
    readBody: vi.fn(),
    setHeaders: vi.fn(),
    appendHeaders: vi.fn(),
    setResponseHeaders: vi.fn(),
    getRequestHeader: vi.fn(),
    getRequestHeaders: vi.fn(),
    sendStream: vi.fn().mockImplementation((event, stream) => stream),
    send: vi.fn().mockImplementation((event, content) => content)
  }
})
