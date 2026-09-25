<template>
  <UDropdownMenu :items="items" :content="{ align: 'end' }">
    <UButton
      icon="i-lucide-languages"
      color="neutral"
      variant="ghost"
      size="md"
      square
      :ui="{ leadingIcon: 'text-primary' }"
      :aria-label="t('language')"
      :title="t('language')" />
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { locale, t } = useI18n()
const i18n = useNuxtApp().$i18n as unknown as {
  locales: Ref<{ code: string; name?: string }[]>
  setLocale: (code: string) => Promise<void>
}

const items = computed<DropdownMenuItem[]>(() => i18n.locales.value.map(option => ({
  label: option.name ?? option.code,
  icon: locale.value === option.code ? 'i-lucide-check' : undefined,
  class: 'cursor-pointer',
  onSelect: () => i18n.setLocale(option.code)
})))
</script>
