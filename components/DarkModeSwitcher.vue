<template>
  <div>
    <button @click="toggleDarkMode()">
      <Icon v-if="isDarkModeEnabled" class="text-accent hover:text-accent-hover" name="lucide:sun" />
      <Icon v-else class="text-amber-700 hover:text-amber-800" name="lucide:moon" />
    </button>
  </div>
</template>
<script lang="ts" setup>
const { toggleDarkMode, isDarkModeEnabled } = useDarkMode()
</script>
