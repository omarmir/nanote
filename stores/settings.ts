import { defineStore } from 'pinia'
import type { InsertSetting } from '~/server/db/schema'
import type { Result } from '~/types/result'

export const useSettingsStore = defineStore('settings', () => {
  const { $settings } = useNuxtApp()
  const settingSetError: Ref<null | string> = ref(null)
  const error: Ref<string | null> = ref($settings.error ? ($settings.error ?? 'Unknown error') : null)
  const settings = reactive({
    isDense: $settings.data.get('isDense') === 'true',
    isParagraphSpaced: $settings.data.get('isParagraphSpaced')
      ? $settings.data.get('isParagraphSpaced') === 'true'
      : true,
    isISODate: $settings.data.get('isISODate') === 'true'
  })

  const setSetting = async (insertSetting: InsertSetting): Promise<Result<null>> => {
    const newSetting: InsertSetting = {
      setting: insertSetting.setting,
      value: insertSetting.value
    }

    const resp = await $fetch('/api/settings', { method: 'POST', body: newSetting })
    if (!resp.success) settingSetError.value = resp.message

    return resp
  }

  const toggleDenseMode = () => (settings.isDense = !settings.isDense)

  const toggleParagraphSpacing = () => (settings.isParagraphSpaced = !settings.isParagraphSpaced)

  const setSettingValue = async (setting: string, value: string) => {
    const newSetting: InsertSetting = {
      setting,
      value
    }
    setSetting(newSetting)
  }

  watch(
    () => settings.isDense,
    () => setSettingValue('isDense', settings.isDense.toString())
  )

  watch(
    () => settings.isParagraphSpaced,
    () => setSettingValue('isParagraphSpaced', settings.isDense.toString())
  )

  watch(
    () => settings.isISODate,
    () => setSettingValue('isISODate', settings.isISODate.toString())
  )

  return {
    toggleDenseMode,
    settings,
    error,
    settingSetError,
    toggleParagraphSpacing
  }
})
