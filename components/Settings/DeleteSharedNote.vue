<template>
  <CommonDeleteAction :status @click="deleteSharedNote()"></CommonDeleteAction>
</template>
<script lang="ts" setup>
import type { SelectShared } from '~/server/db/schema'

const { sharedNote } = defineProps<{ sharedNote: SelectShared }>()

const { status, execute } = useFetch(`/api/settings/shared/${sharedNote.key}`, { method: 'DELETE', immediate: false })

const emit = defineEmits<{
  (e: 'deleted', payload: string): void
}>()

const deleteSharedNote = async () => {
  await execute()
  if (status.value === 'success') emit('deleted', sharedNote.key)
}
</script>
