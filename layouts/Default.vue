<template>
  <div>
    <SlidingSidebar></SlidingSidebar>
    <div id="panel" class="relative h-full max-h-screen rounded-xl transition-all duration-200 lg:ml-[350px]">
      <TopBar class="px-5 lg:px-24"></TopBar>
      <div class="mx-auto w-full px-5 py-6 lg:pl-24 lg:pr-12">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup></script>
