<template>
  <UDashboardPanel id="home">
    <template #header>
      <TopBar :name="t('Note')" />
    </template>
    <template #body>
      <Suspense>
        <CommonEditor v-if="notebookPath" :notebook-path></CommonEditor>
        <template #fallback>
          <div class="ml-[60px] flex w-full flex-col gap-2">
            <USkeleton class="mb-4 h-8 w-2/5"></USkeleton>
            <USkeleton class="h-3 w-2/5"></USkeleton>
            <USkeleton class="h-3 w-4/5"></USkeleton>
            <USkeleton class="h-3 w-3/5"></USkeleton>
            <USkeleton class="h-3 w-1/5"></USkeleton>
          </div>
        </template>
      </Suspense>
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
const route = useRoute()
const notebookPath = route.params.note
const { t } = useI18n()
</script>
