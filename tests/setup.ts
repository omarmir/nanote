import path from 'node:path'
import basePath from '~/server/folder'
import { readdir, rm, unlink, lstat } from 'node:fs/promises'
import { $fetch } from '@nuxt/test-utils'

let authCookie: string

export async function authenticate() {
  const authResponse = await $fetch('/api/auth/login', { method: 'POST', body: { key: 'nanote' } })
  authCookie = `token=${authResponse.token}`
}

export async function getAuthCookie() {
  if (!authCookie) await authenticate()
  return authCookie
}

export async function emptyFolder(folderPath: string) {
  try {
    const files = await readdir(folderPath)
    for (const file of files) {
      const filePath = path.join(folderPath, file)
      const stat = await lstat(filePath)
      if (stat.isDirectory()) {
        await rm(filePath, { recursive: true, force: true })
      } else {
        await unlink(filePath)
      }
    }
    console.log(`Emptied folder: ${folderPath}`)
  } catch (error) {
    console.error(`Error emptying folder: ${error}`)
  }
}

// Example usage:
emptyFolder(basePath)
