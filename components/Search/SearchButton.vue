<template>
  <button
    type="button"
    class="rounded-md bg-neutral-800 px-2 py-1 hover:outline hover:outline-1 hover:outline-accent focus-visible:outline-none"
    aria-label="Search"
    @click="$emit('click')">
    <div class="flex w-full flex-row items-center gap-2 rounded-md py-1">
      <Icon name="lucide:search" class="size-4 text-gray-400" />
      <span class="text-sm text-gray-400">Search</span>
      <kbd class="rounded-md border border-gray-500 bg-gray-600 px-2 py-1 text-xs font-semibold text-gray-100">
        Ctrl+K
      </kbd>
    </div>
  </button>
</template>
<script lang="ts" setup>
defineEmits(['click'])
</script>
