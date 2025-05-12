<template>
  <div>
    <button @click="toggleDark()">
      <Icon v-if="isDark" class="text-accent hover:text-accent-hover" name="lucide:sun" />
      <Icon v-else class="text-amber-700 hover:text-amber-800" name="lucide:moon" />
    </button>
  </div>
</template>
<script lang="ts" setup>
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>
