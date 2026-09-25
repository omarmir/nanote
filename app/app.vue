<template>
  <UApp :locale="uiLocale">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup>
import * as locales from '@nuxt/ui/locale'

const { locale } = useI18n()

const uiLocale = computed(() => {
  if (locale.value === 'zh-CN') return locales.zh_cn
  if (locale.value === 'fr') return locales.fr
  return locales.en
})
const lang = computed(() => uiLocale.value.code)
const dir = computed(() => uiLocale.value.dir)

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: {
    lang,
    dir
  }
})
</script>
