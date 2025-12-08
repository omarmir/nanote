<template>
  <div class="flex flex-col gap-1">
    <ul v-for="item in items">
      <TreeItem :item :expanded class="flex w-full flex-col place-content-center gap-1">
        <template #default="{ isOpen }">
          <UButton
            @click="onToggle(item)"
            class="flex flex-row items-center justify-between"
            :style="{ paddingLeft: `${depth * 32 + 10}px` }"
            :variant="isOpen ? 'soft' : 'ghost'"
            color="neutral">
            <div class="flex w-full flex-row items-start gap-2">
              <slot name="leading">
                <template v-if="item.isPlaceholder">
                  <USkeleton class="size-5"></USkeleton>
                </template>
                <template v-else-if="!item.isPlaceholder && item.isNote" class="self-start">
                  <FileIcon :name="item.label" :is-markdown="item.isMarkdown"></FileIcon>
                </template>
                <template v-else>
                  <UIcon v-if="expanded?.includes(item.apiPath)" name="i-lucide-book-open" class="size-5"></UIcon>
                  <UIcon v-else name="i-lucide-book" class="size-5"></UIcon>
                </template>
              </slot>
              <slot name="label">
                <div v-if="item.isPlaceholder">
                  <USkeleton class="h-2 w-36"></USkeleton>
                </div>
                <div v-else>
                  <div class="text-left" :class="{ 'text-primary': currentNote === item.apiPath }">
                    {{ item.label }}
                  </div>
                  <div
                    class="mt-0.5 flex flex-row gap-2 text-neutral-500 dark:text-neutral-400"
                    v-if="!settingsStore.settings.isDense && item.isNote">
                    <small>
                      {{ t('Updated') }}:
                      <CommonDateDisplay :date="item.updatedAt"></CommonDateDisplay>
                    </small>
                  </div>
                </div>
              </slot>
            </div>
            <slot name="trailing">
              <UIcon
                v-if="!item.isNote"
                name="i-lucide-chevron-down"
                class="size-5 transition-transform duration-200"
                :class="{ 'rotate-180': isOpen }"></UIcon>
            </slot>
          </UButton>
          <TreeNotebooks
            v-model:current-note="currentNote"
            @toggle="onToggle"
            v-if="item.children && isOpen"
            :items="item.children"
            :depth="depth + 1"></TreeNotebooks>
        </template>
      </TreeItem>
    </ul>
  </div>
</template>
<script lang="ts" setup>
const { items, depth = 0 } = defineProps<{ items: NotebookTreeItemClient[]; depth?: number }>()

const { t } = useI18n()

const settingsStore = useSettingsStore()

const expanded = defineModel<string[]>('expanded', { required: false, default: [] })

const currentNote = defineModel<string>('currentNote', { required: false, default: null })

const emit = defineEmits<{
  (e: 'toggle', payload: NotebookTreeItemClient): void
}>()

const onToggle = (item: NotebookTreeItemClient) => {
  emit('toggle', item)
  if (item.isNote) {
    currentNote.value = item.apiPath
    return
  }

  if (expanded.value.includes(item.apiPath)) {
    expanded.value = expanded.value.filter((book) => book !== item.apiPath)
  } else {
    expanded.value = [...expanded.value, item.apiPath]
  }
}
</script>
