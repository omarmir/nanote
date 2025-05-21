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
          <Icon
            v-if="savingState === 'pending'"
            name="lucide:loader-circle"
            class="size-6 animate-spin text-amber-500" />
          <Icon name="gg:rename" class="size-6"></Icon>
          Rename
        </button>
        <button
          class="flex flex-row items-center gap-2 text-gray-900 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-600"
          @click="deleteDialog = true">
          <Icon name="lucide:trash-2" class="size-6" />
          Delete
        </button>
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
        <button
          class="flex flex-row items-center gap-2 text-gray-900 hover:text-accent-hover dark:text-gray-400 dark:hover:text-accent"
          @click="shareDialog = true">
          <Icon v-if="isReadOnly" class="size-6" name="lucide:pencil" />
          <Icon v-else class="size-6" name="lucide:share-2" />
          Share
        </button>
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
    <CommonBaseDialog
      v-model="shareDialog"
      theme="primary"
      title="Share Note"
      desc="Generate a sharable link. Note that they will only be able to view the note only.">
      <div>
        <CommonThemeButton :is-loading="isGeneratingShareLink" class="py-2" theme="info" @click="generateShareCode()">
          Generate
        </CommonThemeButton>
        <div v-if="shareLink" class="mt-4 flex flex-row gap-4">
          <div
            class="shrink-1 whitespace-pre-line break-words bg-gray-200 p-2 font-mono dark:bg-gray-500 dark:text-gray-200">
            {{ shareLink }}
          </div>
          <button
            v-if="isSupported"
            class="bg-transparent hover:text-accent dark:text-white dark:hover:text-accent"
            @click="copyLink()">
            <Icon v-if="isCopied === null" name="lucide:copy"></Icon>
            <Icon v-if="isCopied" name="lucide:circle-check" class="text-emerald-600"></Icon>
            <Icon v-if="isCopied === false" name="lucide:circle-x" class="text-red-500"></Icon>
          </button>
        </div>
      </div>
    </CommonBaseDialog>
  </div>
</template>
<script lang="ts" setup>
import type { SavingState } from '~/types/notebook'
import type { Result } from '~/types/result'
import type { FetchError } from 'ofetch'
import { useClipboard } from '@vueuse/core'

const {
  name,
  notebooks,
  savingState,
  isFocus = false,
  isReadOnly = false
} = defineProps<{
  name: string
  savingState: SavingState
  notebooks: string[]
  isFocus?: boolean
  isReadOnly?: boolean
}>()

const notebookStore = useNotebookStore()
const notebookAPIPath = notePathArrayJoiner([...notebooks, name])

const { name: noteName, extension } = getFileNameAndExtension(name)

const { copy, copied, isSupported } = useClipboard()

const note = ref(noteName)
const isRenaming = computed(() => name !== `${note.value}.${extension}`)
const error: Ref<string | null> = ref(null)
const deleteError: Ref<string | null> = ref(null)
const actionPending = defineModel<boolean>({ required: true })
const deleteDialog = ref(false)
const shareDialog = ref(false)
const shareLink: Ref<string | null> = ref(null)
const shareError: Ref<string | null> = ref(null)
const isGeneratingShareLink: Ref<boolean> = ref(false)
const isCopied: Ref<boolean | null> = ref(null)

const copyLink = async () => {
  if (!shareLink.value) return
  await copy(shareLink.value)
  isCopied.value = copied.value
  setTimeout(() => {
    isCopied.value = null
  }, 5000)
}
const generateShareCode = async () => {
  try {
    const sharedKey = await $fetch<Result<string>>(`/api/share/${notebookAPIPath}`, { method: 'POST' })
    if (!sharedKey.success) {
      shareError.value = sharedKey.message
      return
    } else {
      shareLink.value = `${window.location.origin}/share/${sharedKey.data}`
    }
  } catch (err) {
    console.log(err)
    error.value = (err as FetchError).data.message
  }
}

const renameNote = async () => {
  actionPending.value = true
  const resp = await notebookStore.renameNote(notebooks, name, `${note.value}.${extension}`)
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

defineEmits(['focusmode', 'readonlymode'])
</script>
