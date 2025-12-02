<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">{{ t('recentNotes') }}</h1>
    <ul class="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <li class="flex">
        <UCard class="flex-1">
          <h3 class="mb-1 flex flex-row items-center gap-x-2 font-bold">
            <USkeleton class="text-primary size-6"></USkeleton>
            <USkeleton class="h-4 w-1/3" />
          </h3>
          <div class="flex flex-col gap-2 text-neutral-500">
            <small class="mb-2">
              <USkeleton class="h-2 w-1/2" />
            </small>
            <small class="flex flex-col gap-2">
              <USkeleton class="h-2 w-full" />
              <USkeleton class="h-2 w-1/2" />
              <USkeleton class="h-2 w-1/4" />
            </small>
          </div>
        </UCard>
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
const { t } = useI18n()
</script>
