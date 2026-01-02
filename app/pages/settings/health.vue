<template>
  <div>
    <UPageCard
      v-if="health"
      :title="t('settings.navigation.health')"
      :description="
        health.status === 'OK'
          ? t('settings.pageSubtitles.health.noWarnings')
          : t('settings.pageSubtitles.health.hasWarnings')
      "
      variant="naked"
      orientation="horizontal" />

    <UPageCard
      variant="subtle"
      :ui="{ container: 'p-0 sm:p-0 gap-y-0', wrapper: 'items-stretch', header: 'p-4 mb-0 border-b border-default' }">
      <SkeletonsSharedItem v-if="status === 'pending' || status === 'idle'" />
      <ul v-else role="list" class="divide-default divide-y">
        <li v-if="error">
          <UAlert
            :title="t('failure')"
            :description="error?.data.message ?? error?.message"
            color="error"
            class="rounded-t-none" />
        </li>
        <li
          v-for="warning in health?.warnings"
          :key="warning"
          class="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div class="flex min-w-0 items-center gap-3">
            <div class="min-w-0 text-sm">
              <p class="text-error truncate font-medium">
                {{ warning }}
              </p>
            </div>
          </div>
        </li>
      </ul>
    </UPageCard>
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n()

const { data: health, error, status } = useFetch<Health>('/api/health')
</script>
