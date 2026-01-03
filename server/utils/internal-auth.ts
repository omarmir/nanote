// server/utils/internalAuth.ts
import { nanoid } from 'nanoid'

// State stored in server memory
let currentSecret = nanoid(32)
let expiryTime = Date.now() + 1000 * 60 * 15 // 15 mins

export const getInternalSecret = () => {
  const now = Date.now()

  // If expired, rotate the secret
  if (now > expiryTime) {
    currentSecret = nanoid(32)
    expiryTime = now + 1000 * 60 * 60 * 24
    console.warn('Internal PDF secret rotated')
  }

  return currentSecret
}

export const isValidInternalSecret = (headerValue: string | undefined) => {
  if (!headerValue) return false
  return headerValue === getInternalSecret()
}
