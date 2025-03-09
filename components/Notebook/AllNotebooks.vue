<template>
  <CommonBaseCard>
    <!-- card header -->
    <div class="flex min-h-[70px] flex-wrap items-stretch justify-between bg-transparent px-9 pb-0 pt-5">
      <h3 class="text-dark m-2 ml-0 flex flex-col items-start justify-center">
        <span class="mr-3 text-lg font-medium dark:text-gray-300">Notebooks</span>
        <span class="font-base mt-1 text-sm text-gray-600 dark:text-gray-400">All notebooks</span>
      </h3>
      <div class="min-w-xs relative my-2 flex w-1/3 min-w-72 flex-wrap items-center">
        <div class="relative my-2 flex w-full flex-wrap items-center">
          <!-- TODO: Add Notebook <NotebookNewNotebook @error="notebookAddedError"></NotebookNewNotebook> -->
        </div>
      </div>
    </div>
    <div class="block flex-auto px-9 py-8 pt-6">
      <div class="overflow-x-auto">
        <table class="text-dark my-0 w-full border-neutral-200 align-middle">
          <thead class="align-bottom">
            <tr class="text-secondary-dark text-[0.95rem]">
              <th class="pb-3 text-start text-xs font-medium uppercase text-gray-400 lg:w-1/2">Notebook</th>
              <th class="hidden pb-3 text-center text-xs font-medium uppercase text-gray-400 lg:table-cell">Created</th>
              <th class="hidden pb-3 text-center text-xs font-medium uppercase text-gray-400 lg:table-cell">Updated</th>
              <th class="pb-3 text-center text-xs font-medium uppercase text-gray-400">Notes</th>
              <th class="pb-3 text-center text-xs font-medium uppercase text-gray-400"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="notebookStore.status === 'pending'" class="animate-pulse">
              <td>
                <div class="mb-2.5 h-2 w-4/5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              </td>
              <td class="hidden lg:table-cell">
                <div class="mb-2.5 h-2 w-2/5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              </td>
              <td class="hidden lg:table-cell">
                <div class="mb-2.5 h-2 w-2/5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              </td>
              <td>
                <div class="mb-2.5 h-2 w-2/5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              </td>
              <td>
                <div class="mb-2.5 h-2 w-2/5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              </td>
            </tr>
            <CommonDangerAlert v-if="notebookStore.error">
              {{ notebookStore.error.data.message ?? notebookStore.error.message }}
            </CommonDangerAlert>
            <tr
              v-for="notebook in notebookStore.notebooks?.notebooks"
              :key="notebook.name"
              class="border-b border-neutral-200 last:border-b-0 dark:border-neutral-700">
              <td class="flex flex-col py-2">
                <NotebookContents
                  :on-background="true"
                  :notebook="notebook"
                  type="main"
                  :show-children="notebookStore.currentLevel(notebook, 'main')"></NotebookContents>
              </td>
              <td class="hidden py-2 align-top lg:table-cell">
                <div class="text-sm font-medium">
                  <CommonDateDisplay :date="notebook.createdAt"></CommonDateDisplay>
                </div>
              </td>
              <td class="hidden py-2 align-top lg:table-cell">
                <div class="text-sm font-medium">
                  <CommonDateDisplay :date="notebook.updatedAt"></CommonDateDisplay>
                </div>
              </td>
              <td class="table-cell py-2 align-top">
                <div class="flex w-full justify-center">
                  <div
                    class="flex size-6 flex-row items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-900 dark:bg-gray-700 dark:text-gray-200">
                    <span>{{ notebook.noteCount }}</span>
                  </div>
                </div>
              </td>
              <td class="py-2 align-top">
                <div class="flex flex-row gap-2">
                  <NotebookDelete :notebook="notebook"></NotebookDelete>
                  <NuxtLink
                    class="text-accent hover:text-accent-hover"
                    :to="`/notebook/${notebook.notebooks.join('/')}${notebook.name}`">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="m17 22l-.3-1.5q-.3-.125-.562-.262T15.6 19.9l-1.45.45l-1-1.7l1.15-1q-.05-.3-.05-.65t.05-.65l-1.15-1l1-1.7l1.45.45q.275-.2.538-.337t.562-.263L17 12h2l.3 1.5q.3.125.563.263t.537.337l1.45-.45l1 1.7l-1.15 1q.05.3.05.65t-.05.65l1.15 1l-1 1.7l-1.45-.45q-.275.2-.537.338t-.563.262L19 22zm1-3q.825 0 1.413-.587T20 17t-.587-1.412T18 15t-1.412.588T16 17t.588 1.413T18 19M4 18V6v4.3v-.3zm0 2q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h6l2 2h8q.825 0 1.413.588T22 8v3.275q-.45-.325-.95-.562T20 10.3V8h-8.825l-2-2H4v12h7.075q.075.525.238 1.025T11.7 20z" />
                    </svg>
                  </NuxtLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </CommonBaseCard>
</template>
<script lang="ts" setup>
import { NuxtLink } from '#components'

const notebookStore = useNotebookStore()
</script>
