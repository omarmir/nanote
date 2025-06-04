import { access, constants } from 'node:fs/promises'
import jwt from 'jsonwebtoken'
import SECRET_KEY from '~/server/key'
import type { Result } from '~/types/result'

export function waitforme(millisec: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('')
    }, millisec)
  })
}

export const checkIfPathExists = async (fullPath: string): Promise<boolean> => {
  try {
    await access(fullPath, constants.F_OK)
    return true
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false // Folder does not exist
    }
    throw error // Some other error occurred
  }
}

export const checkLogin = (
  cookie?: string,
  options?: jwt.VerifyOptions & {
    complete?: false
  }
): Result<string | jwt.JwtPayload> => {
  if (!cookie) return { success: false, message: 'Please login first' }

  try {
    const decoded = jwt.verify(cookie, SECRET_KEY, options ?? undefined)
    return { success: true, data: decoded }
  } catch {
    return { success: false, message: 'Unable to verify authentication.' }
  }
}
