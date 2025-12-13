<template>
  <UDropdownMenu :items="items">
    <UButton icon="i-lucide-settings" color="neutral" :variant="isOpen ? 'soft' : 'ghost'" size="sm" />
  </UDropdownMenu>
</template>

<script lang="ts" setup>
import type { DropdownMenuItem } from '@nuxt/ui'
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
