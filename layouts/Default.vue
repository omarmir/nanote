<template>
  <div>
    <SlidingSidebar></SlidingSidebar>
    <div id="panel" class="relative h-full max-h-screen rounded-xl transition-all duration-200 lg:ml-[350px]">
      <TopBar class="px-5 lg:px-24"></TopBar>
      <div class="mx-auto w-full py-6 md:px-5 lg:px-12">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup></script>
