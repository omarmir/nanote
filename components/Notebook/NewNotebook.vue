<template>
  <form class="w-full grow" @submit.prevent="addNotebook">
    <CommonButtonInput v-model="newBook" placeholder="New notebook" class="mb-4">
      <template #icon><IconsAdd></IconsAdd></template>
    </CommonButtonInput>
  </form>
</template>
<script lang="ts" setup>
import { useNotebookStore } from '~/stores/notebooks'

const emit = defineEmits<{
  (e: 'error', payload: string): void
}>()

const store = useNotebookStore()

const newBook = ref('')

const addNotebook = async () => {
  const resp = await store.addNotebook(newBook.value)

  if (resp.success) {
    newBook.value = ''
  } else {
    emit('error', resp.message)
  }
}
</script>
