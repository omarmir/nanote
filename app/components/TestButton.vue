<template>
  <UButton
    size="md"
    :icon="isReadOnly ? 'i-lucide-pencil' : 'i-lucide-pencil-off'"
    color="neutral"
    square
    :ui="{ leadingIcon: 'text-primary' }" />
</template>

<script lang="ts" setup>
const isReadOnly = useState('isReadOnly', () => false)
</script>
