import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import { getAuthCookie } from '~/tests/setup'
import { nanoid } from 'nanoid'
import type { InsertSetting, SelectSetting } from '~/server/db/schema'
import type { Result } from '~/types/result'

describe('Settings API', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('..', import.meta.url)), // Assuming this path is correct as per search.test.ts
    server: true
  })

  let authCookie = ''

  // Define unique keys and values for settings to be used in tests
  const settingKey1 = nanoid()
  const initialValue1 = nanoid()
  const updatedValue1 = nanoid()

  const settingKey2 = nanoid()
  const value2 = nanoid()

  beforeAll(async () => {
    authCookie = await getAuthCookie()
  })

  describe('POST /api/settings', () => {
    it('should create a new setting', async () => {
      const newSetting: InsertSetting = {
        setting: settingKey1,
        value: initialValue1
      }

      const response: Result<null> = await $fetch('/api/settings', {
        method: 'POST',
        body: newSetting,
        headers: { Cookie: authCookie }
      })

      expect(response.success).toBe(true)
      if (response.success) {
        expect(response.data).toBeNull()
      }
    })

    it('should update an existing setting', async () => {
      // This test relies on settingKey1 being created in the previous test.
      // The endpoint uses onConflictDoUpdate, so it will update if settingKey1 exists.
      const updatedSetting: InsertSetting = {
        setting: settingKey1,
        value: updatedValue1
      }

      const response: Result<null> = await $fetch('/api/settings', {
        method: 'POST',
        body: updatedSetting,
        headers: { Cookie: authCookie }
      })

      expect(response.success).toBe(true)
      if (response.success) {
        expect(response.data).toBeNull()
      }
    })
  })

  describe('GET /api/settings/all', () => {
    it('should retrieve all settings, including created and updated ones', async () => {
      // Create a second setting to ensure we are testing retrieval of multiple items
      const newSettingPayload: InsertSetting = {
        setting: settingKey2,
        value: value2
      }
      const postResponse: Result<null> = await $fetch('/api/settings', {
        method: 'POST',
        body: newSettingPayload,
        headers: { Cookie: authCookie }
      })
      expect(postResponse.success).toBe(true) // Ensure creation was successful

      // Fetch all settings
      const response: Result<SelectSetting[]> = await $fetch('/api/settings/all', {
        headers: { Cookie: authCookie }
      })

      expect(response.success).toBe(true)
      if (response.success) {
        expect(response.data).toBeInstanceOf(Array)
        // Check for the first setting (which should have been updated)
        const retrievedSetting1 = response.data?.find((s) => s.setting === settingKey1)
        expect(retrievedSetting1).toBeDefined()
        // Assuming SelectSetting includes id, setting, value
        expect(retrievedSetting1?.value).toBe(updatedValue1)

        // Check for the second setting
        const retrievedSetting2 = response.data?.find((s) => s.setting === settingKey2)
        expect(retrievedSetting2).toBeDefined()
        expect(retrievedSetting2?.value).toBe(value2)

        // Optional: Check if id is present and is a number (if your schema defines it)
        expect(typeof retrievedSetting1?.id).toBe('number')
        expect(typeof retrievedSetting2?.id).toBe('number')
      }
    })
  })
})
