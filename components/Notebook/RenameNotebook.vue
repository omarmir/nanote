<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-row items-center gap-2">
      <button v-if="!onSidebar" class="text-accent hover:text-accent-hover" @click="isRenaming = !isRenaming">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24" title="Rename notebook">
          <g fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M10 4H8v2H5a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h3v2h2zM8 8v8H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"
              clip-rule="evenodd" />
            <path d="M19 16h-7v2h7a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-7v2h7a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1" />
          </g>
        </svg>
      </button>
      <button
        :class="{ 'text-gray-400': onSidebar, 'hover:text-gray-100': onSidebar, 'hover:text-gray-500': !onSidebar }"
        class="flex flex-row items-center gap-2 dark:hover:text-gray-100"
        @click="toggleNotebook()">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 shrink-0" viewBox="0 0 1024 1024">
          <path
            fill="currentColor"
            d="M192 128v768h640V128zm-32-64h704a32 32 0 0 1 32 32v832a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32" />
          <path
            fill="currentColor"
            d="M672 128h64v768h-64zM96 192h128q32 0 32 32t-32 32H96q-32 0-32-32t32-32m0 192h128q32 0 32 32t-32 32H96q-32 0-32-32t32-32m0 192h128q32 0 32 32t-32 32H96q-32 0-32-32t32-32m0 192h128q32 0 32 32t-32 32H96q-32 0-32-32t32-32" />
        </svg>
        <div class="flex flex-col justify-start text-left text-sm font-semibold">
          <span v-show="!isRenaming" class="w-full py-2">
            {{ localNotebook.name }}
          </span>
        </div>
      </button>
      <form v-show="isRenaming" ref="rename-wrapper" class="relative" @submit.prevent="renameNotebook">
        <CommonBaseInput
          ref="rename"
          v-model="newNotebookName"
          aria-label="Notebook name"
          class="-ml-2 !ps-1 pe-20 pl-1 text-left"
          title="Notebook name"></CommonBaseInput>
        <CommonThemeButton
          :show-loading="true"
          :is-loading="renameState"
          type="submit"
          class="absolute bottom-[6px] end-3">
          Rename
        </CommonThemeButton>
      </form>
    </div>
    <CommonDangerAlert v-if="error" class="mb-4 ml-6">{{ error }}</CommonDangerAlert>
  </div>
</template>
<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core'
import type { Notebook } from '~/types/notebook'

const { notebook, hideRename: onSidebar = false } = defineProps<{ notebook: Notebook; hideRename?: boolean }>()

const emit = defineEmits<{
  (e: 'toggle', payload: Notebook): void
}>()

const newNotebookName = ref(notebook.name)
const localNotebook = ref(notebook)
const isRenaming = ref(false)
const renameWrapper = useTemplateRef('rename-wrapper')
const error: Ref<string | null> = ref(null)
const renameState = ref(false)
const notebookStore = useNotebookStore()

onClickOutside(renameWrapper, () => {
  isRenaming.value = false
})

const renameNotebook = async () => {
  renameState.value = true
  const resp = await notebookStore.renameNotebook(notebook, newNotebookName.value)
  if (!resp.success) {
    error.value = resp.message
  }
  renameState.value = false
  isRenaming.value = false
}

const toggleNotebook = () => {
  emit('toggle', localNotebook.value)
}
</script>
