// server/utils/internalAuth.ts
import { customAlphabet } from 'nanoid'

// State stored in server memory
let currentSecret = `${customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', 32)}.${Date.now() + 1000 * 60 * 15}`

export const getCurrentSecret = () => currentSecret

export const setCurrentSecret = (): string => {
  const [_secret, expiryTime] = currentSecret.split('.')
  const now = Date.now()

  if (Number.isNaN(expiryTime)) {
    currentSecret = `${customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', 32)}.${Date.now() + 1000 * 60 * 15}`
  }

  if (now > Number(expiryTime)) {
    currentSecret =
      currentSecret = `${customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', 32)}.${Date.now() + 1000 * 60 * 15}`
  }

  return currentSecret
}
