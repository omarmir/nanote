<template>
  <UDashboardPanel id="home">
    <template #header>
      <TopBar />
    </template>
    <template #body>
      <Suspense>
        <CommonEditor v-if="notebookPath" :notebook-path></CommonEditor>
        <template #fallback>
          <div class="flex w-full flex-col gap-2">
            <USkeleton class="h-5 w-2/5"></USkeleton>
            <USkeleton class="h-5 w-4/5"></USkeleton>
            <USkeleton class="h-5 w-3/5"></USkeleton>
            <USkeleton class="h-5 w-1/5"></USkeleton>
          </div>
        </template>
      </Suspense>
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
const route = useRoute()
const notebookPath = route.params.note
</script>
