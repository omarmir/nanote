<template>
  <UDropdownMenu :items="items">
    <UButton icon="i-lucide-settings" color="neutral" :variant="isOpen ? 'soft' : 'ghost'" size="sm" />
  </UDropdownMenu>
</template>

<script lang="ts" setup>
import type { DropdownMenuItem } from '@nuxt/ui'
import { LazyCommonDelete, LazyNotesRename, LazyNotesShare } from '#components'

const { item, isOpen = false } = defineProps<{ item: NotebookTreeItemClient; isOpen?: boolean }>()
const { t } = useI18n()
const overlay = useOverlay()

const items: DropdownMenuItem[][] = [
  [
    {
      label: t('rename'),
      icon: 'i-custom-gg-rename',
      class: 'cursor-pointer',
      onSelect: () => {
        const modal = overlay.create(LazyNotesRename)
        modal.open({ item })
      }
    },
    {
      label: t('share'),
      icon: 'i-lucide-share-2',
      class: 'cursor-pointer',
      onSelect: () => {
        const modal = overlay.create(LazyNotesShare)
        modal.open({ note: item })
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
        modal.open({ item })
      }
    }
  ]
]
</script>
