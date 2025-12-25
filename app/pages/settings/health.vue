<template>
  <UPageCard
    :title="t('settings.navigation.health')"
    :description="t('settings.pageSubtitles.health')"
    variant="naked"
    orientation="horizontal"
    class="mb-4"></UPageCard>

  <UPageCard
    variant="subtle"
    :ui="{ container: 'p-0 sm:p-0 gap-y-0', wrapper: 'items-stretch', header: 'p-4 mb-0 border-b border-default' }">
    <Suspense>
      <NotesSharedList />
      <template #fallback>
        <SkeletonsSharedItem />
      </template>
    </Suspense>
  </UPageCard>
</template>

<script lang="ts" setup>
const { t } = useI18n()
</script>
