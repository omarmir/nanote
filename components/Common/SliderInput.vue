<template>
  <div>
    <label for="default-range" class="mb-2 block text-sm font-medium"><slot></slot></label>
    <input
      id="default-range"
      v-model="model"
      :max="max"
      :min="min"
      type="range"
      class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700" />
  </div>
</template>
<script lang="ts" setup>
const { max, min } = defineProps<{ max: number; min: number }>()
const model = defineModel<string>({ required: true })
</script>
