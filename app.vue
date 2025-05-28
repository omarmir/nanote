<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script setup lang="ts">
// import { useAuthStore } from '~/stores/auth'
import { useDark } from '@vueuse/core'

useDark()

// const store = useAuthStore()
// const isLoggedIn = await store.verify()

// if (!isLoggedIn.success || (isLoggedIn.success && !isLoggedIn.data)) navigateTo('/login')
</script>
