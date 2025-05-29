<template>
  <div v-if="data && data.warnings.length > 0">
    <CommonBaseCard class="px-4 pb-2 pt-5 lg:px-9">
      <h3 class="text-dark m-2 ml-0 flex flex-col items-start justify-center">
        <span class="mr-3 text-lg font-medium dark:text-gray-300">Warnings</span>
        <span class="font-base mt-1 text-sm text-gray-600 dark:text-gray-400">Consider addressing these warnings</span>
      </h3>
      <ul class="flex flex-col gap-1">
        <li v-for="(warning, index) in data?.warnings" :key="index" class="text-amber-700">
          <span>{{ warning }}</span>
        </li>
      </ul>
    </CommonBaseCard>
  </div>
</template>
<script lang="ts" setup>
const { data } = useFetch('/api/health')
</script>
