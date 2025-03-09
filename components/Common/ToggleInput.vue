<template>
  <div class="flex">
    <label for="search-dropdown" class="sr-only mb-2 text-sm font-medium text-gray-900 dark:text-white">
      <slot name="label"></slot>
    </label>
    <div
      class="z-10 inline-flex shrink-0 items-center rounded-s-lg border border-e-0 border-gray-300 bg-gray-100 px-4 py-2.5 text-center text-sm font-medium text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      type="button">
      <div class="flex items-center">
        <input
          :id="formId"
          v-model="toggle"
          :title
          type="checkbox"
          value=""
          class="h-4 w-4 cursor-pointer rounded-sm border-gray-300 bg-gray-100 text-accent focus:ring-2 focus:ring-accent dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-accent" />
        <label :for="formId" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          <slot name="label"></slot>
        </label>
      </div>
    </div>
    <div class="relative w-full">
      <input
        v-model="model"
        type="text"
        class="rounded-s-gray-100 rounded-s-2 z-20 block w-full rounded-e-lg border border-gray-300 bg-gray-50 p-2.5 pe-16 text-sm text-gray-900 focus:border-accent focus:outline-none focus:ring-accent dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-accent"
        :placeholder="placeholder"
        required />
      <button
        type="submit"
        class="absolute end-0 top-0 flex h-full items-center rounded-e-lg border border-blue-700 bg-blue-700 p-2.5 text-sm font-medium text-white hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-accent dark:hover:bg-accent-hover dark:focus:ring-accent-hover">
        <slot name="icon"></slot>
      </button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { customAlphabet } from 'nanoid'
const { placeholder, title } = defineProps<{ placeholder: string; title: string }>()
const model = defineModel<string | null>({ required: true })
const toggle = defineModel<boolean>('toggle', { required: true })
const nanoid = customAlphabet('abcdefghijklmnop')
const formId = nanoid()
</script>
