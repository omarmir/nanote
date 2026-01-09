import { defineStore } from 'pinia'
import type { InsertSetting } from '~~/server/db/schema'
import type { Result } from '#shared/types/result'
import type { FetchError } from 'ofetch'

export const useSettingsStore = defineStore('settings', () => {
  const isLoaded = ref(false)
  const error = ref<string | null>(null)
  const settingSetError = ref<string | null>(null)

  interface LocalSettings {
    isDense: boolean
    isParagraphSpaced: boolean
    isISODate: boolean
    isCodeViewAllFiles: boolean
    [key: string]: boolean
  }

  const settings = ref<LocalSettings>({
    isDense: true,
    isParagraphSpaced: true,
    isISODate: true,
    isCodeViewAllFiles: false
  })

  const loadSettings = async () => {
    if (isLoaded.value) return

    try {
      const resp = await $fetch<Result<Settings[]>>('/api/settings/all')
      if (resp.success) {
        resp.data.forEach((setting) => {
          settings.value[setting.setting] = setting.value === 'true'
        })
      } else {
        error.value = resp.message
      }
    } catch (e) {
      error.value = (e as FetchError).data.message || 'Failed to load settings'
    } finally {
      isLoaded.value = true
    }
  }

  const setSetting = async (insertSetting: InsertSetting): Promise<Result<null>> => {
    const newSetting: InsertSetting = {
      setting: insertSetting.setting,
      value: insertSetting.value
    }

    const resp = await $fetch('/api/settings', { method: 'POST', body: newSetting })
    if (!resp.success) settingSetError.value = resp.message

    return resp
  }

  const toggleDenseMode = () => {
    settings.value.isDense = !settings.value.isDense
  }

  const toggleParagraphSpacing = () => (settings.value.isParagraphSpaced = !settings.value.isParagraphSpaced)

  const setSettingValue = async (setting: string, value: string) => {
    const newSetting: InsertSetting = {
      setting,
      value
    }
    setSetting(newSetting)
  }

  watch(
    () => settings.value.isDense,
    () => {
      setSettingValue('isDense', settings.value.isDense.toString())
    }
  )

  watch(
    () => settings.value.isParagraphSpaced,
    () => setSettingValue('isParagraphSpaced', settings.value.isParagraphSpaced.toString())
  )

  watch(
    () => settings.value.isISODate,
    () => setSettingValue('isISODate', settings.value.isISODate.toString())
  )

  watch(
    () => settings.value.isCodeViewAllFiles,
    () => setSettingValue('isCodeViewAllFiles', settings.value.isCodeViewAllFiles.toString())
  )

  return {
    toggleDenseMode,
    settings,
    error,
    settingSetError,
    toggleParagraphSpacing,
    loadSettings,
    isLoaded
  }
})
