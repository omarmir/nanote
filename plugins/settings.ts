import type { Settings } from '~/server/utils/drizzle'
import type { Result } from '~/types/result'

export default defineNuxtPlugin(async (_nuxtApp) => {
  const { data: settings, error } = await useFetch('/api/settings/all', {
    immediate: true,
    lazy: false,
    transform: (data: Result<Settings[]> | null) => {
      if (!data) return new Map<string, string>()
      if (data.success) {
        // Convert array to map: { [setting]: value }
        const settingsMap = new Map<string, string>()
        for (const item of data.data) {
          settingsMap.set(item.setting, item.value)
        }
        return settingsMap
      } else {
        return new Map<string, string>()
      }
    }
  })

  return {
    provide: {
      settings: {
        data: settings.value ?? new Map<string, string>(),
        error: error.value?.statusMessage
      }
    }
  }
})
