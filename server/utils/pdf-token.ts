import { nanoid } from 'nanoid'

// Prefix keys to avoid collisions in storage
const STORAGE_PREFIX = 'pdf-token:'

export async function createPdfToken() {
  const token = nanoid(32) // Generate a secure, unique ID

  // Store the token in Nitro's default storage (memory/fs)
  // TTL (Time To Live) is 60 seconds
  await useStorage().setItem(`${STORAGE_PREFIX}${token}`, true, { ttl: 60 })

  return token
}

export async function verifyPdfToken(token: string | undefined) {
  if (!token) return false

  // Check if the key exists in storage
  return await useStorage().hasItem(`${STORAGE_PREFIX}${token}`)
}
