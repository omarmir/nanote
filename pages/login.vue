<template>
  <CommonBaseCard class="p-8">
    <form class="flex flex-col gap-2" @submit.prevent="login()">
      <div class="mb-4 flex shrink-0 items-center justify-start gap-4">
        <Icon name="marketeq:notebook" class="size-10"></Icon>
        <h1 class="text-xl font-bold text-gray-900 dark:text-gray-200">nanote</h1>
      </div>
      <label class="text-sm font-medium">Secret Key</label>
      <div class="relative">
        <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
          <Icon name="marketeq:lock" class="size-5"></Icon>
        </div>
        <CommonBaseInput
          id="secret-key"
          v-model="secretKey"
          name="secret-key"
          placeholder="Secret key"
          aria-placeholder="Secret key"
          type="password"
          required></CommonBaseInput>
      </div>
      <p v-if="store.error" class="text-sm font-medium text-red-500">{{ store.error }}</p>
      <div class="mt-2 flex flex-wrap place-content-end">
        <CommonThemeButton :show-loading="true" :is-loading="store.isLoggingIn" type="submit" class="py-2">
          Login
        </CommonThemeButton>
      </div>
    </form>
  </CommonBaseCard>
</template>
<script lang="ts" setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'auth'
})

const store = useAuthStore()
const secretKey: Ref<string | null> = ref(null)

const login = () => store.login(secretKey.value)
</script>
