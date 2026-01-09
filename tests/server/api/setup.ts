import { vi } from 'vitest'

// Mock auto-imported utils
vi.stubGlobal('authorize', vi.fn().mockResolvedValue(true))
vi.stubGlobal('editAllNotes', 'editAllNotes')

// Stub Nitro/Nuxt globals
vi.stubGlobal('defineEventHandler', (fn: any) => fn)
vi.stubGlobal('useTranslation', () => (key: string) => key)
vi.stubGlobal('createError', (err: any) => err)
vi.stubGlobal('getQuery', (event: any) => {
  // Basic mock extracting from URL query params
  if (event.path && event.path.includes('?')) {
    const queryParams = new URLSearchParams(event.path.split('?')[1])
    return Object.fromEntries(queryParams.entries())
  }
  return {}
})
