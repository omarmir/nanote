<template>
  <div class="-mx-3 mb-5 flex flex-wrap">
    <div class="mb-6 w-full max-w-full px-3 sm:flex-none">
      <CommonEditor :notebook-path></CommonEditor>
    </div>
  </div>
</template>
<script setup lang="ts">
const route = useRoute()
const notebookPath = route.params.note
</script>
