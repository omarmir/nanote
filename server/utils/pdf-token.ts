import { nanoid } from 'nanoid'

export async function createPdfToken() {
  const token = nanoid(32) // Generate a secure, unique ID

  // Store the token in Nitro's default storage (memory/fs)
  // TTL (Time To Live) is 60 seconds
  await useStorage().setItem(`${PDF_STORAGE_PREFIX}${token}`, true, { ttl: 60 })

  return token
}

export async function verifyPdfToken(token: string | undefined) {
  if (!token) return false

  // Check if the key exists in storage
  return await useStorage().hasItem(`${PDF_STORAGE_PREFIX}${token}`)
}
