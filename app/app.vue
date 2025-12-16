<template>
  <UApp :locale="locales[locale]">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup>
import * as locales from '@nuxt/ui/locale'

const { locale } = useI18n()

const lang = computed(() => locales[locale.value].code)
const dir = computed(() => locales[locale.value].dir)

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: {
    lang,
    dir
  }
})

const settingsStore = useSettingsStore()

onMounted(async () => {
  await settingsStore.loadSettings()
})
</script>
