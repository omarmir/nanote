<template>
  <UCard :variant="notebook.isOpen ? 'subtle' : 'outline'" :ui="{ body: 'sm:p-4' }">
    <div class="flex flex-col gap-4">
      <div class="flex flex-row justify-between">
        <div class="flex grow flex-row gap-3">
          <div class="bg-primary-500/20 flex size-12 place-content-center items-center rounded-md">
            <UIcon name="i-lucide-book" class="text-primary-400 size-6"></UIcon>
          </div>
          <div>
            <UButton
              variant="ghost"
              class="text-black dark:text-white"
              @click="toggle(notebook)"
              :title="t('openNotebook', { notebook: notebook.label })">
              <h3 class="font-bold">{{ notebook.label }}</h3>
            </UButton>
            <div class="ml-2 flex flex-row items-center text-neutral-400">
              <small>{{ notebook.noteCount }} {{ t('note', notebook.noteCount === 1 ? 1 : 2) }}</small>
              <span class="mx-1 font-extrabold">&middot;</span>
              <small>{{ notebook.notebookCount }} {{ t('notebook', notebook.notebookCount === 1 ? 1 : 2) }}</small>
            </div>
          </div>
        </div>
        <div class="flex flex-row items-start">
          <UButton
            @click="toggle(notebook)"
            size="sm"
            variant="ghost"
            color="warning"
            icon="i-lucide-fold-vertical"
            :title="t('closeNotebooks', 1)"
            :class="{ invisible: !notebook.isOpen }"></UButton>
          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" @click="" />
            <template #item="{ item }">
              <NotebooksNew>
                <template #trigger>
                  <UButton
                    :icon="item.icon"
                    class="w-full"
                    size="md"
                    :color="item.color ? item.color : 'neutral'"
                    variant="ghost"
                    :title="item.label">
                    {{ item.label }}
                  </UButton>
                </template>
              </NotebooksNew>
            </template>
          </UDropdownMenu>
        </div>
      </div>
      <div
        class="flex flex-row gap-2 rounded-md bg-zinc-300/20 p-3 dark:bg-zinc-700/20"
        v-if="!settingsStore.settings.isDense">
        <small class="text-neutral-500 dark:text-neutral-400">{{ t('Created') }}:</small>
        <small class="text-neutral-600 dark:text-neutral-300">
          <CommonDateDisplay :date="notebook.createdAt"></CommonDateDisplay>
        </small>
      </div>
    </div>
    <template #footer v-if="notebook.children && notebook.isOpen">
      <TreeNotebooks :items="notebook.children" type="root" @toggle="toggle"></TreeNotebooks>
    </template>
  </UCard>
</template>
<script lang="ts" setup>
import type { DropdownMenuItem } from '@nuxt/ui'

const settingsStore = useSettingsStore()

const { notebook } = defineProps<{ notebook: NotebookTreeItemClient }>()
const { t } = useI18n()

const items: DropdownMenuItem[][] = [
  [
    {
      label: t('rename'),
      icon: 'i-gg-rename'
    },
    {
      label: t('Note', 1),
      icon: 'i-lucide-plus'
    },
    {
      label: t('Notebook', 1),
      icon: 'i-lucide-plus'
    }
  ],
  [
    {
      label: t('delete'),
      color: 'error',
      icon: 'i-lucide-trash-2'
    }
  ]
]
const notebookStore = useNotebookStore()
const openError: Ref<string | null> = ref(null)

const toggle = async (item: NotebookTreeItemClient) => {
  const resp = await notebookStore.toggleRootNotebook(item)
}
</script>
