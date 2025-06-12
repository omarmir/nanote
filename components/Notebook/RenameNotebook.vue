<template>
  <div>
    <div class="flex flex-row items-center gap-2">
      <button
        v-if="type === 'main'"
        class="flex items-center text-teal-600 hover:text-teal-800"
        @click="isRenaming = !isRenaming">
        <Icon name="gg:rename" class="size-6" />
      </button>
      <button
        draggable="true"
        :class="{
          'text-gray-400 hover:text-gray-100': type === 'sidebar',
          'hover:text-gray-500': type === 'main',
          'rounded-md bg-teal-600/20 ring-2 ring-teal-600': isDragOver
        }"
        class="flex flex-row items-center gap-2 dark:hover:text-gray-100"
        @dragstart="onDragStart"
        @dragleave="onDragLeave"
        @dragover="onDragOver"
        @drop="onDrop"
        @click="toggleNotebook()">
        <Icon name="lucide:book" />
        <div class="flex flex-col justify-start text-left text-sm font-semibold">
          <span v-show="!isRenaming" class="w-full">
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
    <CommonDangerAlert v-if="openError" class="mb-4 ml-6">
      {{ openError }}
    </CommonDangerAlert>
  </div>
</template>
<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core'
import type { Notebook, NotebookDisplay } from '~/types/notebook'

const { notebook, type } = defineProps<{ notebook: Notebook; type: NotebookDisplay }>()

const newNotebookName = ref(notebook.name)
const localNotebook = ref(notebook)
const isRenaming = ref(false)
const renameWrapper = useTemplateRef('rename-wrapper')
const error: Ref<string | null> = ref(null)
const renameState = ref(false)
const notebookStore = useNotebookStore()
const { onDragLeave, onDragOver, onDragStart, onDrop, isDragOver } = useDragItem(localNotebook)

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

const openError: Ref<string | null> = ref(null)
const toggleNotebook = async () => {
  const resp = await notebookStore.toggleNotebook(notebook, type)
  if (!resp.success) openError.value = resp.message
}
</script>
