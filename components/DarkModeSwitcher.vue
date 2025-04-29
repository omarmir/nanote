<template>
  <div>
    <button class="text-gray-400 hover:text-white" @click="toggleDarkMode()">
      <Icon v-if="isDarkModeEnabled" name="lucide:sun" />
      <Icon v-else name="lucide:moon" />
    </button>
  </div>
</template>
<script lang="ts" setup>
const { toggleDarkMode, isDarkModeEnabled } = useDarkMode()
</script>
