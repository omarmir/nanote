<template>
  <CommonBaseCard class="px-4 pb-2 pt-5 lg:px-9">
    <!-- card header -->
    <div class="flex min-h-[70px] flex-wrap items-stretch justify-between bg-transparent pt-5">
      <h3 class="text-dark m-2 ml-0 flex flex-col items-start justify-center">
        <span class="mr-3 text-lg font-medium dark:text-gray-300">Recent Notes</span>
        <span class="font-base mt-1 text-sm text-gray-600 dark:text-gray-400">Notes created or modified recently</span>
      </h3>
      <div class="relative my-2 flex flex-wrap items-center">
        <!--Possible buttons-->
      </div>
    </div>
    <!-- end card header -->
    <!-- card body  -->
    <div class="block flex-auto pt-6">
      <div class="overflow-x-auto">
        <table class="text-dark my-0 w-full border-neutral-200 align-middle">
          <thead class="align-bottom">
            <tr class="text-secondary-dark text-[0.95rem]">
              <th class="pb-3 pr-2 text-start text-xs font-medium uppercase text-gray-400">Note</th>
              <th class="pb-3 text-start text-xs font-medium uppercase text-gray-400">Notebook</th>
              <th class="hidden pb-3 text-center text-xs font-medium uppercase text-gray-400 lg:table-cell">Created</th>
              <th class="hidden pb-3 text-center text-xs font-medium uppercase text-gray-400 lg:table-cell">Updated</th>
              <th class="hidden pb-3 text-start text-xs font-medium uppercase text-gray-400 lg:table-cell">Size</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="note in notes"
              :key="note.notebook + note.name"
              class="border-b border-dashed border-neutral-200 last:border-b-0 dark:border-neutral-700">
              <td class="pr-2">
                <div class="my-3 flex flex-row items-center gap-2 hover:text-gray-400 dark:hover:text-gray-100">
                  <Icon name="lucide:file" />
                  <div class="flex flex-col justify-start">
                    <NuxtLink
                      :to="`/note/${notePathArrayJoiner(note.notebook)}/${note.name}`"
                      class="text-sm font-semibold">
                      {{ note.name }}
                    </NuxtLink>
                  </div>
                </div>
              </td>
              <td>
                <span class="text-sm font-medium">
                  {{ note.notebook.join(' / ') }}
                </span>
              </td>
              <td class="hidden lg:table-cell">
                <div class="text-sm font-medium">
                  <CommonDateDisplay :date="note.createdAt"></CommonDateDisplay>
                </div>
              </td>
              <td class="hidden lg:table-cell">
                <div class="text-sm font-medium">
                  <CommonDateDisplay :date="note.createdAt"></CommonDateDisplay>
                </div>
              </td>
              <td class="hidden lg:table-cell">
                <span class="text-light-inverse text-sm font-medium">{{ note.size ? note.size / 1000 : 0 }}kb</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </CommonBaseCard>
</template>
<script lang="ts" setup>
import type { Note } from '~/types/notebook'

const { display } = defineProps<{ display: number }>()

const { data: notes, execute } = useFetch<Note[]>('/api/notes', {
  immediate: false,
  lazy: true,
  query: { display }
})

await execute()
</script>
