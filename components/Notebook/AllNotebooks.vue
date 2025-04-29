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
          <NotebookNewNotebook @error="(err) => (notebookAddedError = err)"></NotebookNewNotebook>
        </div>
      </div>
    </div>
    <CommonDangerAlert v-if="notebookAddedError" class="rounded-none">
      {{ notebookAddedError }}
    </CommonDangerAlert>
    <div class="block flex-auto px-9 py-8 pt-6">
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
                <div class="flex flex-row items-center gap-4">
                  <NotebookDelete :notebook></NotebookDelete>
                  <NotebookManage :notebook></NotebookManage>
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
const notebookStore = useNotebookStore()
const notebookAddedError: Ref<string | null> = ref(null)
</script>
