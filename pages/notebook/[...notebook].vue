<template>
  <CommonBaseCard class="px-9 py-5">
    <h1 class="mb-2 flex flex-row items-center text-xl">
      <ul class="flex flex-row gap-2">
        <li v-for="(segment, index) in notebook" :key="index" class="flex flex-row gap-2">
          <span v-if="index > 0">></span>
          <NuxtLink
            class="hover:text-gray-400 dark:hover:text-gray-100"
            :to="`/notebook/${notebook.slice(0, index + 1).join('/')}`">
            {{ segment }}
          </NuxtLink>
        </li>
      </ul>
    </h1>
    <CommonDangerAlert v-if="error" class="mb-4 mt-4">{{ error.data.message }}</CommonDangerAlert>
    <table class="mt-2">
      <thead>
        <tr>
          <th class="text-start text-xs font-medium uppercase text-gray-400">Name</th>
          <th class="hidden text-center text-xs font-medium uppercase text-gray-400 lg:table-cell">Created</th>
          <th class="hidden text-center text-xs font-medium uppercase text-gray-400 lg:table-cell">Updated</th>
          <th class="hidden text-center text-xs font-medium uppercase text-gray-400 lg:table-cell">Contents</th>
          <th class="hidden text-center text-xs font-medium uppercase text-gray-400 lg:table-cell">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="note in contents?.notes" :key="`nt-${note.name}`">
          <td class="py-2 align-top">
            <NuxtLink
              :to="`/note/${contents?.pathArray.join('/')}/${note.name}`"
              class="flex flex-row items-center gap-2 hover:text-gray-400 dark:hover:text-gray-100">
              <IconsNote></IconsNote>
              {{ note.name }}
            </NuxtLink>
          </td>
          <td class="hidden py-2 align-top lg:table-cell">
            <div class="text-sm font-medium">
              <CommonDateDisplay :date="note.createdAt"></CommonDateDisplay>
            </div>
          </td>
          <td class="hidden py-2 align-top lg:table-cell">
            <div class="text-sm font-medium">
              <CommonDateDisplay :date="note.updatedAt"></CommonDateDisplay>
            </div>
          </td>
          <td class="hidden py-2 text-center align-top lg:table-cell">{{ note.size?.toFixed(2) }}kb</td>
          <td></td>
        </tr>
        <tr v-for="nestedNotebook in contents?.notebooks" :key="`nb-${nestedNotebook.name}`">
          <td class="py-2 align-top">
            <NuxtLink
              class="flex flex-row items-center gap-2 hover:text-gray-400 dark:hover:text-gray-100"
              :to="`/notebook/${contents?.pathArray.join('/')}/${nestedNotebook.name}`">
              <IconsNotebook class="size-5 grow-0"></IconsNotebook>
              {{ nestedNotebook.name }}
            </NuxtLink>
          </td>
          <td class="hidden py-2 align-top lg:table-cell">
            <div class="text-sm font-medium">
              <CommonDateDisplay :date="nestedNotebook.createdAt"></CommonDateDisplay>
            </div>
          </td>
          <td class="hidden py-2 align-top lg:table-cell">
            <div class="text-sm font-medium">
              <CommonDateDisplay :date="nestedNotebook.updatedAt"></CommonDateDisplay>
            </div>
          </td>
          <td class="hidden py-2 text-center align-top lg:table-cell">
            {{ nestedNotebook.notebookCount + nestedNotebook.noteCount }}
          </td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </CommonBaseCard>
</template>
<script lang="ts" setup>
import { IconsNote } from '#components'
import type { NotebookContents } from '~/types/notebook'

const route = useRoute()
const notebook: string[] = typeof route.params.notebook === 'string' ? [route.params.notebook] : route.params.notebook
const apiPath = notePathArrayJoiner(notebook)

const { data: contents, error } = useFetch<NotebookContents>(`/api/notebook/${apiPath}`, { immediate: true })
</script>
