import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', () => {
  const lsIsDense: boolean = (localStorage.getItem('isDense') ?? 'false') === 'true' //its stored as a string must compare as string.
  const lsIsDark: boolean = (localStorage.getItem('isDark') ?? 'false') === 'true' //its stored as a string must compare as string.

  /**
   * Dense list
   */
  const isDenseListEnabled: Ref<boolean> = ref(lsIsDense)
  const toggleDenseMode = () => {
    isDenseListEnabled.value = !isDenseListEnabled.value
    localStorage.setItem('isDense', isDenseListEnabled.value.toString())
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
    setInitialDarkMode
  }
})
