<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UAuthForm
      :title="t('loginTitle')"
      :description="t('loginMessage')"
      :fields="fields"
      @submit="onSubmit"
      icon="i-lucide-lock">
      <template #leading class="">
        <CommonLogo class="inline-block size-10 shrink-0"></CommonLogo>
      </template>
    </UAuthForm>
    <UAlert
      v-if="error"
      color="error"
      variant="outline"
      icon="i-lucide-circle-alert"
      :title="t('failure')"
      :description="error"
      as="div"
      class="mt-2" />
  </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
import { FetchError } from 'ofetch'
const { t } = useI18n()

definePageMeta({
  layout: 'auth'
})

const { fetch } = useUserSession()

const error: Ref<null | string> = ref(null)

const fields: AuthFormField[] = [
  {
    name: 'secretKey',
    label: t('secretKey'),
    type: 'password',
    placeholder: t('secretKeyPlaceholder'),
    required: true
  }
]

const onSubmit = async (event: FormSubmitEvent<{ secretKey: string }>) => {
  try {
    const login = await $fetch<boolean>('/api/auth/login', {
      method: 'POST',
      body: { secretKey: event.data.secretKey }
    })

    if (login) {
      await fetch()
      error.value = null
      await navigateTo('/')
    }
  } catch (e) {
    const err = e as FetchError
    error.value = err.data.statusMessage || 'Login failed'
  }
}
</script>
