<template>
  <UCard variant="outline" :ui="{ body: 'sm:p-4' }">
    <div class="flex flex-col gap-4">
      <div class="flex flex-row justify-between">
        <div class="flex grow flex-row gap-3">
          <div class="flex size-12 place-content-center items-center rounded-md bg-blue-500/20">
            <UIcon name="i-lucide-book" class="size-6 text-blue-400"></UIcon>
          </div>
          <div>
            <h3 class="font-bold">{{ notebook.name }}</h3>
            <div class="flex flex-row items-center text-neutral-400">
              <small>{{ notebook.noteCount }} {{ t('note', notebook.noteCount === 1 ? 1 : 2) }}</small>
              <span class="mx-1 font-extrabold">&middot;</span>
              <small>{{ notebook.notebookCount }} {{ t('notebook', notebook.notebookCount === 1 ? 1 : 2) }}</small>
            </div>
          </div>
        </div>
        <div>
          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="xs" />
          </UDropdownMenu>
        </div>
      </div>
      <div class="flex flex-col gap-2 rounded-md bg-zinc-700/20 p-3">
        <small class="text-neutral-400">{{ t('Created') }}:</small>
        <small class="text-neutral-300">
          <CommonDateDisplay :date="notebook.createdAt"></CommonDateDisplay>
        </small>
      </div>
    </div>
  </UCard>
</template>
<script lang="ts" setup>
import type { DropdownMenuItem } from '@nuxt/ui'

const { notebook } = defineProps<{ notebook: Notebook }>()
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
</script>
