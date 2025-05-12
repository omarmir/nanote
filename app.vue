<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script lang="ts" setup async>
const store = useAuthStore()
const verify = await store.verify()

if (!verify) {
  navigateTo('/login')
}
</script>
