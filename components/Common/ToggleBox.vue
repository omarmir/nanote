<template>
  <label class="inline-flex cursor-pointer items-center">
    <input v-model="model" type="checkbox" value="" class="peer sr-only" />
    <div
      class="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-blue-600 dark:peer-focus:ring-blue-800 rtl:peer-checked:after:-translate-x-full"></div>
    <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
      <slot></slot>
    </span>
  </label>
</template>
<script lang="ts" setup>
const model = defineModel<boolean>({ required: true })
</script>
