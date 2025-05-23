<template>
  <div class="flex flex-col pb-2">
    <div class="flex flex-col-reverse gap-y-4 md:flex-row md:items-baseline">
      <h1 class="w-full text-5xl">
        <input
          v-model="note"
          :disabled="savingState === 'pending' || savingState === 'saving'"
          class="w-full bg-transparent text-gray-900 focus:italic focus:outline-none dark:text-gray-200"
          aria-label="Rename name"
          aria-details="Allows you to rename the note" />
      </h1>
      <div class="flex flex-row gap-4">
        <NoteRename v-model="note" :name :notebooks></NoteRename>
        <NoteDelete :name :notebooks @deleted="noteDeleted">
          <div
            class="flex flex-row items-center gap-2 text-gray-900 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-600">
            <Icon name="lucide:trash-2" class="size-6" />
            Delete
          </div>
        </NoteDelete>
        <button
          class="flex flex-row items-center gap-2 text-gray-900 hover:text-accent-hover dark:text-gray-400 dark:hover:text-accent"
          @click="$emit('focusmode')">
          <Icon v-if="isFocus" class="size-6" name="lucide:eye-off" />
          <Icon v-else class="size-6" name="lucide:eye" />
          Focus
        </button>
        <button
          class="flex flex-row items-center gap-2 text-gray-900 hover:text-accent-hover dark:text-gray-400 dark:hover:text-accent"
          @click="$emit('readonlymode')">
          <Icon v-if="isReadOnly" class="size-6" name="lucide:pencil" />
          <Icon v-else class="size-6" name="lucide:pencil-off" />
          Edit
        </button>
        <NoteShare :notebook-a-p-i-path></NoteShare>
        <NuxtLink
          v-if="isFocus"
          to="/"
          class="flex flex-row items-center gap-2 text-gray-900 hover:text-accent-hover dark:text-gray-400 dark:hover:text-accent">
          <Icon name="lucide:house" class="size-6" />
          Home
        </NuxtLink>
      </div>
    </div>
    <CommonDangerAlert v-if="error" class="mb-4 w-full">{{ error }}</CommonDangerAlert>
  </div>
</template>
<script lang="ts" setup>
import type { SavingState } from '~/types/notebook'

const {
  name,
  notebooks,
  isFocus = false,
  isReadOnly = false,
  savingState
} = defineProps<{
  name: string
  notebooks: string[]
  isFocus?: boolean
  isReadOnly?: boolean
  savingState: SavingState
}>()

const notebookAPIPath = notePathArrayJoiner([...notebooks, name])

const { name: noteName } = getFileNameAndExtension(name)

const note = ref(noteName)
const error: Ref<string | null> = ref(null)

const noteDeleted = () => navigateTo('/')

defineEmits(['focusmode', 'readonlymode'])
</script>
