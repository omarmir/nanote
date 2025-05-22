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
      : true
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

  /**
   * Dense list
   */
  const setDenseMode = async () => {
    const setting: InsertSetting = {
      setting: 'isDense',
      value: settings.isDense.toString()
    }
    setSetting(setting)
  }
  const toggleDenseMode = () => (settings.isDense = !settings.isDense)

  /**
   * Paragraph spacing
   */
  const setParagraphSpacing = async () => {
    const setting: InsertSetting = {
      setting: 'isParagraphSpaced',
      value: settings.isParagraphSpaced.toString()
    }
    setSetting(setting)
  }
  const toggleParagraphSpacing = () => (settings.isParagraphSpaced = !settings.isParagraphSpaced)

  watch(
    () => settings.isDense,
    () => setDenseMode()
  )

  watch(
    () => settings.isParagraphSpaced,
    () => setParagraphSpacing()
  )

  return {
    toggleDenseMode,
    settings,
    error,
    settingSetError,
    toggleParagraphSpacing
  }
})
