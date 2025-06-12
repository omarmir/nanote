<template>
  <ul
    v-if="notebookContents && (notebookContents.notes.length > 0 || notebookContents.notebooks)"
    class="flex flex-col gap-2">
    <li v-for="note in notebookContents.notes" :key="note.name">
      <div
        :class="{
          'text-gray-900 hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-100': type === 'main'
        }"
        class="flex w-full flex-row justify-between text-gray-400 hover:text-gray-200 has-[.delete-button:hover]:!text-red-500">
        <NuxtLink
          :to="`/note/${notePathArrayJoiner(note.notebook)}/${note.name}`"
          exact-active-class="text-teal-600"
          @click="outsideClick()">
          <div class="flex flex-col gap-1">
            <div class="flex flex-row items-center gap-2">
              <Icon v-if="note.isMarkdown" name="lucide:file-text" />
              <Icon v-else name="lucide:file" />
              <span class="text-sm">{{ note.name }}</span>
            </div>
            <div v-if="type === 'main' || (type === 'sidebar' && !settingsStore.settings.isDense)" class="ml-7 text-xs">
              Created: {{ formatNoteDate(note.createdAt) }}
            </div>
          </div>
        </NuxtLink>
        <div v-if="type === 'main'" class="flex flex-row place-content-end items-center gap-4">
          <NoteDelete :name="note.name" :notebooks="note.notebook" class="delete-button"></NoteDelete>
        </div>
      </div>
    </li>
    <li
      v-for="nestedNotebook in notebookContents.notebooks"
      :key="nestedNotebook.path"
      class="flex flex-col items-start gap-2">
      <div
        class="flex w-full flex-row justify-between has-[.delete-button:hover]:text-red-500 has-[.manage-button:hover]:text-blue-500">
        <NotebookRenameNotebook :type :notebook="nestedNotebook" :hide-rename="false" />
        <div v-if="type === 'main'" class="flex flex-row place-content-end items-center gap-4">
          <NotebookDelete class="delete-button" :notebook="nestedNotebook" />
          <NotebookManage class="manage-button" :notebook="nestedNotebook" />
        </div>
      </div>
      <NotebookContents :notebook="nestedNotebook" :show-childre="true" :type></NotebookContents>
    </li>
  </ul>
</template>
<script lang="ts" setup>
import type { NotebookContents, NotebookDisplay } from '~/types/notebook'
const { outsideClick } = useSidebar()

const settingsStore = useSettingsStore()

const { notebookContents, type } = defineProps<{
  notebookContents: NotebookContents | null | undefined
  type: NotebookDisplay
}>()

const formatNoteDate = (dateStr: string) => {
  const date = new Date(dateStr)
  if (settingsStore.settings.isISODate) {
    const [isoDate, isoTime] = date.toISOString().split('T')
    return `${isoDate} @ ${isoTime.split('.')[0]}`
  } else {
    return `${date.toLocaleDateString()} @ ${date.toLocaleTimeString()}`
  }
}
</script>
