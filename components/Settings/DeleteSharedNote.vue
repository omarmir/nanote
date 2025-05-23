<template>
  <div>
    <CommonDeleteAction :status @click="deleteDialog = true"></CommonDeleteAction>
    <CommonBaseDialog
      v-model="deleteDialog"
      theme="danger"
      title="Delete Sharing Link"
      desc="This will delete the shared link and cannot be undone. Are you sure you want to delete this shared link?">
      <template #desc>
        This will delete
        <span class="font-bold text-red-500">{{ sharedNote.name ?? `Key: ${sharedNote.key}` }}</span>
        and cannot be undone.
        <br />
        <br />
        Are you sure you want to delete this share? Once deleted any recipient of the shared link will not be able to
        access the note.
      </template>
      <div class="flex flex-row flex-wrap justify-end gap-4">
        <CommonThemeButton
          :show-loading="true"
          :is-loading="status === 'pending'"
          theme="danger"
          @click="deleteSharedNote()">
          Delete
        </CommonThemeButton>
        <CommonThemeButton @click="deleteDialog = false">Cancel</CommonThemeButton>
        <CommonDangerAlert v-if="error" class="mb-4 w-full">{{ error }}</CommonDangerAlert>
      </div>
    </CommonBaseDialog>
  </div>
</template>
<script lang="ts" setup>
import type { SelectShared } from '~/server/db/schema'

const { sharedNote } = defineProps<{ sharedNote: SelectShared }>()

const { status, execute, error } = useFetch(`/api/settings/shared/${sharedNote.key}`, {
  method: 'DELETE',
  immediate: false
})

const deleteDialog = ref(false)

const emit = defineEmits<{
  (e: 'deleted', payload: string): void
}>()

const deleteSharedNote = async () => {
  await execute()
  if (status.value === 'success') emit('deleted', sharedNote.key)
}
</script>
