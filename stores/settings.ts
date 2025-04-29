import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', () => {
  const lsIsDense: boolean = (localStorage.getItem('isDense') ?? 'false') === 'true' //its stored as a string must compare as string.

  const isDenseListEnabled: Ref<boolean> = ref(lsIsDense)

  const toggleDenseMode = () => {
    isDenseListEnabled.value = !isDenseListEnabled.value
    localStorage.setItem('isDense', isDenseListEnabled.value.toString())
  }

  return {
    toggleDenseMode,
    isDenseListEnabled
  }
})
