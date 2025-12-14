<template>
  <UApp v-if="settingsStore.isLoaded">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup>
useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: {
    lang: 'en'
  }
})

const settingsStore = useSettingsStore()

onMounted(async () => {
  await settingsStore.loadSettings()
})
</script>
