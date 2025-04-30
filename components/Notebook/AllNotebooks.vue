<template>
  <CommonBaseCard class="px-4 pb-2 pt-5 lg:px-9">
    <!-- card header -->
    <div class="flex min-h-[70px] flex-wrap items-stretch justify-between bg-transparent">
      <h3 class="text-dark m-2 ml-0 flex flex-col items-start justify-center">
        <span class="mr-3 text-lg font-medium dark:text-gray-300">Notebooks</span>
        <span class="font-base mt-1 text-sm text-gray-600 dark:text-gray-400">All notebooks</span>
      </h3>
      <div class="min-w-xs relative my-2 flex w-1/3 min-w-72 flex-wrap items-center">
        <div class="relative my-2 flex w-full flex-wrap items-center">
          <NotebookNewNotebook @error="(err) => (notebookAddedError = err)"></NotebookNewNotebook>
        </div>
      </div>
    </div>
    <CommonDangerAlert v-if="notebookAddedError" class="rounded-none">
      {{ notebookAddedError }}
    </CommonDangerAlert>
    <div class="block flex-auto pt-6">
      <div class="overflow-x-auto">
        <table class="text-dark my-0 w-full border-neutral-200 align-middle">
          <thead class="align-bottom">
            <tr class="text-secondary-dark text-[0.95rem]">
              <th class="pb-3 text-start text-xs font-medium uppercase text-gray-400 lg:w-1/2">
                <div class="flex min-h-5 flex-row items-center gap-2">
                  <span>Notebook</span>
                  <CommonCollapseNotebooksButton
                    v-if="notebookStore.mainOpenNotebooks.length > 0"
                    @click="notebookStore.resetMainNotebook()"></CommonCollapseNotebooksButton>
                </div>
              </th>
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
            <tr v-else-if="notebookStore.status === 'error'">
              <td colspan="5">
                <CommonDangerAlert>
                  <span v-if="notebookStore.error">
                    {{ notebookStore.error.data.message ?? notebookStore.error.message }}
                  </span>
                </CommonDangerAlert>
              </td>
            </tr>
            <template v-for="notebook in notebookStore.notebooks?.notebooks" v-else :key="notebook.name">
              <tr class="space-y-4 has-[.delete-button:hover]:text-red-500 has-[.manage-button:hover]:text-blue-500">
                <td class="py-2 align-middle">
                  <NotebookRenameNotebook
                    type="main"
                    :notebook="notebook"
                    :hide-rename="false"></NotebookRenameNotebook>
                </td>
                <td class="hidden py-2 align-middle lg:table-cell">
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-400">
                    <CommonDateDisplay :date="notebook.createdAt"></CommonDateDisplay>
                  </div>
                </td>
                <td class="hidden py-2 align-middle lg:table-cell">
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-400">
                    <CommonDateDisplay :date="notebook.updatedAt"></CommonDateDisplay>
                  </div>
                </td>
                <td class="table-cell py-2 align-middle">
                  <div class="flex w-full justify-center">
                    <div
                      class="flex size-6 flex-row items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-900 dark:bg-gray-700 dark:text-gray-200">
                      <span>{{ notebook.noteCount }}</span>
                    </div>
                  </div>
                </td>
                <td class="py-2 align-middle">
                  <div class="flex flex-row place-content-end items-center gap-4">
                    <NotebookDelete class="delete-button" :notebook></NotebookDelete>
                    <NotebookManage class="manage-button" :notebook></NotebookManage>
                  </div>
                </td>
              </tr>
              <tr class="border-b border-neutral-200 last:border-b-0 dark:border-neutral-700">
                <td colspan="5">
                  <NotebookContents
                    :notebook="notebook"
                    type="main"
                    :show-children="notebookStore.currentLevel(notebook, 'main')"></NotebookContents>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </CommonBaseCard>
</template>
<script lang="ts" setup>
const notebookStore = useNotebookStore()
const notebookAddedError: Ref<string | null> = ref(null)
</script>
