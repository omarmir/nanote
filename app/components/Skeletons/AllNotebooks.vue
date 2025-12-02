<template>
  <div>
    <div class="flex flex-row items-center justify-between">
      <h1 class="mb-6 text-2xl font-bold">{{ t('Notebook', 2) }}</h1>
    </div>
    <ul class="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <li>
        <UCard variant="outline" :ui="{ body: 'sm:p-4' }">
          <div class="flex flex-col gap-4">
            <div class="flex flex-row justify-between">
              <div class="flex grow flex-row gap-3">
                <USkeleton class="flex size-12 place-content-center items-center rounded-md"></USkeleton>
                <div>
                  <USkeleton class="mb-2 h-6 w-48" />
                  <div class="flex flex-row items-center text-gray-400">
                    <USkeleton class="h-4 w-56" />
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-2 rounded-md bg-zinc-700/20 p-3">
              <USkeleton class="h-3 w-24" />
              <USkeleton class="h-3 w-56" />
            </div>
          </div>
        </UCard>
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
const { t } = useI18n()
</script>
