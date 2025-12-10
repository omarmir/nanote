<template>
  <div>
    <UDropdownMenu :items="items">
      <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" />
    </UDropdownMenu>
  </div>
</template>
<script lang="ts" setup>
import type { DropdownMenuItem } from '@nuxt/ui'
import { LazyNotebooksNew } from '#components'

const { notebook } = defineProps<{ notebook: NotebookTreeItemClient }>()
const { t } = useI18n()
const overlay = useOverlay()

const items: DropdownMenuItem[][] = [
  [
    {
      label: t('rename'),
      icon: 'i-custom-gg-rename',
      class: 'cursor-pointer'
    },
    {
      label: t('Note', 1),
      icon: 'i-lucide-plus',
      class: 'cursor-pointer'
    },
    {
      label: t('Notebook', 1),
      icon: 'i-lucide-plus',
      class: 'cursor-pointer',
      onSelect: () => {
        const modal = overlay.create(LazyNotebooksNew)
        modal.open({ notebook })
      }
    }
  ],
  [
    {
      label: t('delete'),
      color: 'error',
      icon: 'i-lucide-trash-2',
      class: 'cursor-pointer'
    }
  ]
]
</script>
