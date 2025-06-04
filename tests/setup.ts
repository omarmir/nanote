import path from 'node:path'
import jwt from 'jsonwebtoken'
import { notesPath, uploadPath } from '~/server/folder'
import { readdir, rm, unlink, lstat } from 'node:fs/promises'

let authCookie: string

export async function authenticate() {
  const token = jwt.sign({ app: 'nanote' }, 'nanote', { expiresIn: '7d', audience: 'authorized' })
  authCookie = `token=${token}`
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
emptyFolder(notesPath)
emptyFolder(uploadPath)
