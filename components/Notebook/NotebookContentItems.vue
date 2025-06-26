<template>
  <ul
    v-if="notebookContents && (notebookContents.notes.length > 0 || notebookContents.notebooks)"
    class="flex flex-col gap-2">
    <CommonListItem v-for="note in notebookContents.notes" :key="note.name" :item="note">
      <div
        :class="{
          'text-gray-900 hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-100': type === 'main'
        }"
        class="flex w-full flex-row justify-between text-gray-400 hover:text-gray-200 has-[.delete-button:hover]:!text-red-500">
        <NoteListName :note :type></NoteListName>
        <div v-if="type === 'main'" class="flex flex-row place-content-end items-center gap-4">
          <NoteDelete :name="note.name" :notebooks="note.notebook" class="delete-button"></NoteDelete>
        </div>
      </div>
    </CommonListItem>
    <CommonListItem
      v-for="nestedNotebook in notebookContents.notebooks"
      :key="nestedNotebook.path"
      :item="nestedNotebook"
      class="flex flex-col items-start gap-2">
      <div
        class="flex w-full flex-row justify-between has-[.delete-button:hover]:text-red-500 has-[.manage-button:hover]:text-blue-500">
        <NotebookRenameNotebook :type :notebook="nestedNotebook" class="flex-grow" />
        <div v-if="type === 'main'" class="flex flex-row place-content-end items-center gap-4">
          <NotebookDelete class="delete-button" :notebook="nestedNotebook" />
          <NotebookManage class="manage-button" :notebook="nestedNotebook" />
        </div>
      </div>
      <NotebookContents :notebook="nestedNotebook" :show-childre="true" :type></NotebookContents>
    </CommonListItem>
  </ul>
</template>
<script lang="ts" setup>
import type { NotebookContents, NotebookDisplay } from '~/types/notebook'

const { notebookContents, type } = defineProps<{
  notebookContents: NotebookContents | null | undefined
  type: NotebookDisplay
}>()
</script>
