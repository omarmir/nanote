<template>
  <CommonButtonInput v-model="model" :name :placeholder :leading-indicator="true">
    <template #indicator>
      <div
        class="z-10 inline-flex shrink-0 items-center rounded-s-md border border-e-0 border-gray-300 bg-gray-100 px-4 py-2.5 text-center text-sm font-medium text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
    </template>
    <template #icon>
      <slot name="icon"></slot>
    </template>
  </CommonButtonInput>
</template>
<script lang="ts" setup>
import { CommonButtonInput } from '#components'
import { customAlphabet } from 'nanoid'
const { placeholder, title, name } = defineProps<{ placeholder: string; title: string; name: string }>()
const model = defineModel<string | null>({ required: true })
const toggle = defineModel<boolean>('toggle', { required: true })
const nanoid = customAlphabet('abcdefghijklmnop')
const formId = nanoid()
</script>
