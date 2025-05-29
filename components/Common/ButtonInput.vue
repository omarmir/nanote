<template>
  <div class="flex">
    <label :for="name" class="mb-2 text-nowrap text-sm font-medium text-gray-900 dark:text-white">
      <slot name="label"></slot>
    </label>
    <slot name="indicator"></slot>
    <div class="relative w-full">
      <input
        v-model="model"
        :name
        :class="leadingIndicator ? 'rounded-e-md' : 'rounded-md'"
        type="text"
        class="rounded-s-gray-100 z-20 block w-full border border-gray-300 bg-gray-50 p-2.5 pe-16 text-sm text-gray-900 focus:border-accent focus:outline-none focus:ring-accent dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-accent"
        :placeholder="placeholder"
        required />
      <button
        type="submit"
        class="absolute end-0 top-0 flex h-full items-center rounded-e-md border border-blue-700 bg-blue-700 p-2.5 text-sm font-medium text-white hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-accent dark:hover:bg-accent-hover dark:focus:ring-accent-hover">
        <slot name="icon"></slot>
      </button>
    </div>
  </div>
</template>
<script lang="ts" setup>
const {
  placeholder,
  leadingIndicator = false,
  name
} = defineProps<{ placeholder: string; leadingIndicator?: boolean; name: string }>()
const model = defineModel<string | null>({ required: true })
</script>
