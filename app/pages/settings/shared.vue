<template>
  <div>
    <UPageCard
      title="Members"
      description="Invite new members by email address."
      variant="naked"
      orientation="horizontal"
      class="mb-4">
      <UButton label="Invite people" color="neutral" class="w-fit lg:ms-auto" />
    </UPageCard>

    <UPageCard
      variant="subtle"
      :ui="{ container: 'p-0 sm:p-0 gap-y-0', wrapper: 'items-stretch', header: 'p-4 mb-0 border-b border-default' }">
      <template #header>
        <UInput icon="i-lucide-search" :placeholder="t('searchShared')" autofocus class="w-full" />
      </template>
      <Suspense>
        <NotesSharedList />
        <template #fallback>
          <SkeletonsSharedItem />
        </template>
      </Suspense>
    </UPageCard>
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n()
</script>
