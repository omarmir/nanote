<template>
  <div class="-mx-3 mb-5 flex flex-wrap">
    <div class="mb-6 w-full max-w-full px-3 sm:flex-none">
      <Suspense>
        <CommonEditor :notebook-path></CommonEditor>
        <template #fallback>
          <div>
            <CommonLoadingIndicator class="w-2/5"></CommonLoadingIndicator>
            <CommonLoadingIndicator class="w-4/5"></CommonLoadingIndicator>
            <CommonLoadingIndicator class="w-3/5"></CommonLoadingIndicator>
            <CommonLoadingIndicator class="w-1/5"></CommonLoadingIndicator>
          </div>
        </template>
      </Suspense>
    </div>
  </div>
</template>
<script setup lang="ts">
const route = useRoute()
const notebookPath = route.params.note
</script>
