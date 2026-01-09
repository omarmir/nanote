import { mkdtempSync, rmSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

export function createTestContext() {
  // Create a unique temp directory
  const baseDir = mkdtempSync(join(tmpdir(), 'nanote-test-'))
  const notesDir = join(baseDir, 'notes')
  const uploadsDir = join(baseDir, 'uploads')

  mkdirSync(notesDir)
  mkdirSync(uploadsDir)

  return {
    baseDir,
    notesDir,
    uploadsDir,
    cleanup: () => {
      rmSync(baseDir, { recursive: true, force: true })
    }
  }
}
