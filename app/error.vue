<template>
  <div class="flex h-screen items-center justify-center">
    <div class="flex w-8/12 flex-row items-center justify-between gap-24">
      <div>
        <h1 class="text-primary mb-4 text-2xl font-bold">
          <CommonLogo class="inline-block size-8" />
          {{ error?.statusCode }}
          <span>{{ $t(`errors.httpCodes.${error?.statusCode}`) }}</span>
        </h1>
        <p class="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
          {{ error?.message }}
        </p>
        <Can :ability="editAllNotes">
          <UButton to="/" variant="ghost">
            <UIcon name="i-lucide-chevron-left" class="mr-2 -ml-1 h-5 w-5" />
            {{ t('navigation.home') }}
          </UButton>
        </Can>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const { t } = useI18n()

defineProps({
  error: Object as () => NuxtError
})
</script>
