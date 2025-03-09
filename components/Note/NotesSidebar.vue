<template>
  <aside
    id="sidenav-main"
    ref="sidebar"
    class="fixed inset-y-0 z-40 m-0 flex w-[300px] shrink-0 flex-col overflow-y-auto overflow-x-hidden bg-neutral-900 transition-all duration-300 ease-in-out lg:ml-[300px] lg:translate-x-0 [&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-neutral-300 [&::-webkit-scrollbar]:w-1">
    <div class="h-svw bg-cyan-300/5">
      <div class="mt-24 pl-7">
        <slot></slot>
      </div>
    </div>
    <div class="absolute right-0 top-2">
      <button class="h-12 w-12 text-gray-400 hover:text-white" @click="emit('close')">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z" />
        </svg>
      </button>
    </div>
  </aside>
</template>
<script lang="ts" setup>
const emit = defineEmits(['close'])
</script>
