<template>
  <NuxtLink
    class="cursor-pointer"
    :to="`/note/${notePathArrayJoiner(note.notebook)}/${note.name}`"
    draggable="true"
    exact-active-class="text-teal-600"
    @dragstart="onDragStart"
    @dragleave="onDragLeave"
    @dragover="onDragOver"
    @drop="onDrop"
    @click="outsideClick()">
    <div class="flex flex-col gap-1">
      <div class="flex flex-row items-center gap-2">
        <Icon v-if="note.isMarkdown" name="lucide:file-text" />
        <Icon v-else name="lucide:file" />
        <span class="text-sm">{{ note.name }}</span>
      </div>
      <div v-if="type === 'main' || (type === 'sidebar' && !settingsStore.settings.isDense)" class="ml-7 text-xs">
        Created: {{ formatNoteDate(note.createdAt, settingsStore.settings.isISODate) }}
      </div>
    </div>
  </NuxtLink>
</template>
<script lang="ts" setup>
import type { Note, NotebookDisplay } from '~/types/notebook'
const { outsideClick } = useSidebar()

const { note, type } = defineProps<{ note: Note; type: NotebookDisplay }>()
const { onDragLeave, onDragOver, onDragStart, onDrop } = useDragItem(note)

const settingsStore = useSettingsStore()
// const notebookStore = useNotebookStore()
</script>
