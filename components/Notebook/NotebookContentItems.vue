<template>
  <ul v-if="notebookContents">
    <li v-for="note in notebookContents.notes" :key="note.name" class="py-2">
      <NuxtLink
        :to="`/note/${notePathArrayJoiner(note.notebook)}/${note.name}`"
        exact-active-class="text-teal-600"
        :class="{ 'text-gray-900 hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-100': onBackground }"
        class="flex flex-col gap-1 text-gray-400 hover:text-gray-200"
        @click="outsideClick()">
        <div class="flex flex-row items-center gap-2">
          <Icon name="lucide:file" />
          <span class="text-sm">{{ note.name }}</span>
        </div>
        <div v-if="onBackground || (!onBackground && !settingsStore.isDenseListEnabled)" class="ml-7 text-xs">
          Created: {{ new Date(note.createdAt).toLocaleDateString('en-CA') }} @
          {{ new Date(note.createdAt).toLocaleTimeString() }}
        </div>
      </NuxtLink>
    </li>
    <li
      v-for="nestedNotebook in notebookContents.notebooks"
      :key="nestedNotebook.path"
      class="flex flex-row items-center">
      <NotebookContents :on-background :notebook="nestedNotebook" :show-childre="true" :type></NotebookContents>
    </li>
  </ul>
</template>
<script lang="ts" setup>
import type { NotebookContents, NotebookDisplay } from '~/types/notebook'
const { outsideClick } = useSidebar()

const settingsStore = useSettingsStore()

const { notebookContents, onBackground, type } = defineProps<{
  notebookContents: NotebookContents | null | undefined
  onBackground: boolean
  type: NotebookDisplay
}>()
</script>
