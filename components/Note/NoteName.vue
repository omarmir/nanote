<template>
  <div class="flex flex-col pb-2">
    <div class="flex flex-col-reverse gap-y-4 md:flex-row md:items-baseline">
      <h1 class="w-full text-5xl">
        <input
          v-model="note"
          class="w-full bg-transparent text-gray-900 focus:italic focus:outline-none dark:text-gray-200"
          aria-label="Rename name"
          aria-details="Allows you to rename the note" />
      </h1>
      <div class="flex flex-row gap-4">
        <button
          v-if="isRenaming"
          :disabled="savingState === 'pending'"
          class="flex flex-row items-center gap-2 text-gray-900 hover:text-accent-hover dark:text-gray-400 dark:hover:text-accent"
          @click="renameNote">
          <svg v-if="savingState === 'pending'" xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path stroke-dasharray="16" stroke-dashoffset="16" d="M12 3c4.97 0 9 4.03 9 9">
                <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="16;0" />
                <animateTransform
                  attributeName="transform"
                  dur="1.5s"
                  repeatCount="indefinite"
                  type="rotate"
                  values="0 12 12;360 12 12" />
              </path>
              <path
                stroke-dasharray="64"
                stroke-dashoffset="64"
                stroke-opacity="0.3"
                d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z">
                <animate fill="freeze" attributeName="stroke-dashoffset" dur="1.2s" values="64;0" />
              </path>
            </g>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24" title="Rename notebook">
            <g fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M10 4H8v2H5a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h3v2h2zM8 8v8H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"
                clip-rule="evenodd" />
              <path d="M19 16h-7v2h7a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-7v2h7a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1" />
            </g>
          </svg>
          Rename
        </button>
        <button
          class="flex flex-row items-center gap-2 text-gray-900 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-600"
          @click="deleteDialog = true">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2zM7 6v13z" />
          </svg>
          Delete
        </button>
        <button
          class="flex flex-row items-center gap-2 text-gray-900 hover:text-accent-hover dark:text-gray-400 dark:hover:text-accent"
          @click="$emit('focusmode')">
          <svg v-if="isFocus" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M2 5.27L3.28 4L20 20.72L18.73 22l-3.08-3.08c-1.15.38-2.37.58-3.65.58c-5 0-9.27-3.11-11-7.5c.69-1.76 1.79-3.31 3.19-4.54zM12 9a3 3 0 0 1 3 3a3 3 0 0 1-.17 1L11 9.17A3 3 0 0 1 12 9m0-4.5c5 0 9.27 3.11 11 7.5a11.8 11.8 0 0 1-4 5.19l-1.42-1.43A9.86 9.86 0 0 0 20.82 12A9.82 9.82 0 0 0 12 6.5c-1.09 0-2.16.18-3.16.5L7.3 5.47c1.44-.62 3.03-.97 4.7-.97M3.18 12A9.82 9.82 0 0 0 12 17.5c.69 0 1.37-.07 2-.21L11.72 15A3.064 3.064 0 0 1 9 12.28L5.6 8.87c-.99.85-1.82 1.91-2.42 3.13" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 9a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-4.5c5 0 9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S2.73 16.39 1 12c1.73-4.39 6-7.5 11-7.5M3.18 12a9.821 9.821 0 0 0 17.64 0a9.821 9.821 0 0 0-17.64 0" />
          </svg>
          Focus
        </button>
        <NuxtLink
          v-if="isFocus"
          to="/"
          class="flex flex-row items-center gap-2 text-gray-900 hover:text-accent-hover dark:text-gray-400 dark:hover:text-accent">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M6 19h3v-6h6v6h3v-9l-6-4.5L6 10zm-2 2V9l8-6l8 6v12h-7v-6h-2v6zm8-8.75" />
          </svg>
          Home
        </NuxtLink>
      </div>
    </div>
    <CommonDangerAlert v-if="error" class="mb-4 w-full">{{ error }}</CommonDangerAlert>
    <CommonBaseDialog
      v-model="deleteDialog"
      theme="danger"
      title="Delete Note"
      desc="Are you sure you want to delete this note?">
      <div class="flex flex-row justify-end gap-4">
        <CommonThemeButton class="py-2" theme="danger" @click="deleteNote()">Delete</CommonThemeButton>
        <CommonThemeButton class="py-2" @click="deleteDialog = false">Cancel</CommonThemeButton>
      </div>
    </CommonBaseDialog>
  </div>
</template>
<script lang="ts" setup>
import type { SavingState } from '~/types/notebook'

const {
  name,
  notebooks,
  savingState,
  isFocus = false
} = defineProps<{ name: string; savingState: SavingState; notebooks: string[]; isFocus?: boolean }>()

const notebookStore = useNotebookStore()

const note = ref(name)

const isRenaming = computed(() => name !== note.value)
const error: Ref<string | null> = ref(null)
const deleteError: Ref<string | null> = ref(null)
const actionPending = defineModel<boolean>({ required: true })
const deleteDialog = ref(false)

const renameNote = async () => {
  actionPending.value = true
  const resp = await notebookStore.renameNote(notebooks, name, note.value)
  if (resp.success) {
    error.value = null
    navigateTo(resp.data.newName)
  } else {
    error.value = resp.message
  }
}

const deleteNote = async () => {
  actionPending.value = true
  const resp = await notebookStore.deleteNote(notebooks, name)
  if (resp.success) {
    deleteError.value = null
    navigateTo('/')
    deleteDialog.value = true
  } else {
    deleteError.value = resp.message
  }
  actionPending.value = true
}

defineEmits(['focusmode'])
</script>
