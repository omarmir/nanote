<template>
  <button class="bg-transparent text-red-500 hover:text-red-700">
    <Icon v-if="status === 'pending'" name="lucide:loader-circle" class="animate-spin" />
    <Icon v-else-if="status === 'error' && !isDeleted" name="lucide:circle-x" class="text-red-500"></Icon>
    <slot v-else>
      <Icon name="lucide:trash-2"></Icon>
    </slot>
  </button>
</template>
<script lang="ts" setup>
const { status } = defineProps<{ status: 'pending' | 'error' | 'idle' | 'success' }>()

const isDeleted: Ref<boolean | null> = ref(null)

watch(
  () => status,
  (newStatus) => {
    if (newStatus === 'error') {
      isDeleted.value = false
      setTimeout(() => {
        isDeleted.value = null
      }, 5000)
    }
  }
)
</script>
