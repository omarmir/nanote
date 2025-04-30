<template>
  <nav class="mt-4 flex flex-row justify-between gap-2" navbar-scroll="true">
    <div class="relative flex w-full flex-row items-center justify-between lg:hidden">
      <NuxtLink to="/">
        <div class="flex shrink-0 items-center justify-start gap-4">
          <Icon name="marketeq:notebook" class="size-10"></Icon>
          <h1 class="text-xl font-bold text-white">nanote</h1>
        </div>
      </NuxtLink>
      <!--Sidebar button-->
      <a
        href="javascript:void(0)"
        class="flex h-12 w-12 cursor-pointer items-center justify-center rounded-md border border-solid border-gray-200 bg-white text-center align-middle text-base font-medium leading-normal text-stone-500 shadow-none transition-colors duration-150 ease-in-out dark:border-neutral-700 dark:bg-neutral-900"
        @click="toggleSideMenu()">
        <Icon name="lucide:menu" class="size-6" />
      </a>
      <!--Sidebar button end-->
    </div>
  </nav>
</template>
<script lang="ts" setup>
const { toggleSideMenu } = useSidebar()
</script>
