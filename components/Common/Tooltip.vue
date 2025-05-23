<template>
  <div class="tooltip relative inline-block">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4 text-white">
      <path
        fill-rule="evenodd"
        d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z"
        clip-rule="evenodd" />
    </svg>
    <span class="tooltiptext invisible absolute z-10 w-48 rounded-md bg-black p-2 text-center md:w-96 lg:w-[512px]">
      <slot></slot>
    </span>
  </div>
</template>
<style lang="postcss" scoped>
.tooltip:hover .tooltiptext {
  visibility: visible;
}
</style>
