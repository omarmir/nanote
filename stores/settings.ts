import { defineStore } from 'pinia'
import type { InsertSetting } from '~/server/db/schema'

export const useSettingsStore = defineStore('settings', () => {
  const { $settings } = useNuxtApp()
  const settingSetError: Ref<null | string> = ref(null)
  const error: Ref<string | null> = ref($settings.error ? ($settings.error ?? 'Unknown error') : null)
  const lsIsDark: boolean = (localStorage.getItem('isDark') ?? 'false') === 'true' //its stored as a string must compare as string.

  /**
   * Dense list
   */
  const isDenseListEnabled: Ref<boolean> = ref($settings.data.get('isDense') === 'true')
  const toggleDenseMode = async () => {
    isDenseListEnabled.value = !isDenseListEnabled.value
    const setting: InsertSetting = {
      setting: 'isDense',
      value: isDenseListEnabled.value.toString()
    }

    const resp = await $fetch('/api/settings', { method: 'POST', body: setting })

    if (!resp.success) settingSetError.value = resp.message
  }

  /**
   * Dark mode
   */
  const isDarkModeEnabled: Ref<boolean> = ref(lsIsDark)

  const toggleDarkMode = () => {
    isDarkModeEnabled.value = !isDarkModeEnabled.value
    localStorage.setItem('isDark', isDarkModeEnabled.value.toString())

    document.documentElement.classList.toggle('dark')
  }

  const setInitialDarkMode = () => {
    if (lsIsDark && !document.documentElement.classList.contains('dark')) document.documentElement.classList.add('dark')
  }

  return {
    toggleDenseMode,
    isDenseListEnabled,
    toggleDarkMode,
    isDarkModeEnabled,
    setInitialDarkMode,
    error,
    settingSetError
  }
})
