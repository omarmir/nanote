<template>
  <UDropdownMenu :items="items">
    <UButton icon="i-lucide-ellipsis-vertical" color="neutral" :variant="isOpen ? 'soft' : 'ghost'" size="sm" />
  </UDropdownMenu>
</template>

<script lang="ts" setup>
import type { DropdownMenuItem } from '@nuxt/ui'
import { LazyNotebooksNew } from '#components'
import { LazyNotesNew } from '#components'
import { LazyCommonDelete } from '#components'

const { notebook, isOpen = false } = defineProps<{ notebook: NotebookTreeItemClient; isOpen?: boolean }>()
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
      class: 'cursor-pointer',
      onSelect: () => {
        const modal = overlay.create(LazyNotesNew)
        modal.open({ notebook })
      }
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
      class: 'cursor-pointer',
      onSelect: () => {
        const modal = overlay.create(LazyCommonDelete)
        modal.open({ item: notebook })
      }
    }
  ]
]
</script>
