<template>
  <div>
    <UPageCard
      :title="t('settings.navigation.shared')"
      :description="t('settings.pageSubtitles.shared')"
      variant="naked"
      orientation="horizontal"
      class="mb-4"></UPageCard>

    <UPageCard
      variant="subtle"
      :ui="{ container: 'p-0 sm:p-0 gap-y-0', wrapper: 'items-stretch', header: 'p-4 mb-0 border-b border-default' }">
      <template #header>
        <UInput
          icon="i-lucide-search"
          :placeholder="t('searchShared')"
          autofocus
          class="w-full"
          v-model="searchString" />
      </template>
      <Suspense>
        <NotesSharedList :search-string />
        <template #fallback>
          <SkeletonsSharedItem />
        </template>
      </Suspense>
    </UPageCard>
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n()
const searchString = defineModel<string>({ required: true })
</script>
