<template>
  <nav class="mt-4 flex flex-row justify-between gap-2" navbar-scroll="true">
    <div class="relative ml-auto flex items-center sm:ml-2 lg:hidden">
      <!--Sidebar button-->
      <a
        href="javascript:void(0)"
        class="flex h-12 w-12 cursor-pointer items-center justify-center rounded-md border border-solid border-gray-200 bg-white text-center align-middle text-base font-medium leading-normal text-stone-500 shadow-none transition-colors duration-150 ease-in-out dark:border-neutral-700 dark:bg-neutral-900"
        @click="toggleSideMenu()">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-6 w-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path>
        </svg>
      </a>
      <!--Sidebar button end-->
    </div>
  </nav>
</template>
<script lang="ts" setup>
const { toggleSideMenu } = useSidebar()
</script>
