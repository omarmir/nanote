<template>
  <UModal
    :title="t('delete')"
    v-model:open="open"
    :close="{ onClick: () => emit('close', false) }"
    :aria-describedby="t('delete')">
    <template #default>
      <slot name="trigger" />
    </template>
    <template #body>
      <i18n-t :keypath="item.isNote ? 'deleteNote' : 'deleteNotebook'" tag="h3" class="mb-2">
        <template v-slot:item>
          <span class="text-warning">{{ item.label }}</span>
        </template>
      </i18n-t>
      <div class="flex flex-row place-content-end items-center gap-4">
        <UButton color="error">{{ t('delete') }}</UButton>
        <UButton color="neutral">{{ t('cancel') }}</UButton>
      </div>
    </template>
  </UModal>
</template>
<script lang="ts" setup>
const { item } = defineProps<{ item: NotebookTreeItem }>()
const open = ref(false)
const emit = defineEmits<{ close: [boolean] }>()
const { t } = useI18n()
</script>
