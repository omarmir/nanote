<template>
  <div class="flex flex-col gap-1">
    <ul v-for="item in items" :key="item.apiPath">
      <TreeItem :key="item.apiPath" :item :expanded class="flex w-full flex-col place-content-center gap-0.5">
        <template #default="{ isOpen }">
          <UFieldGroup class="group rounded-md">
            <UButton
              class="target flex grow flex-row items-center justify-between group-hover:bg-neutral-500/20"
              :style="{ paddingLeft: `${depth * 24 + 10}px` }"
              :variant="isOpen ? 'soft' : 'ghost'"
              color="neutral"
              @click="onToggle(item)">
              <div class="flex w-full flex-row items-start gap-1">
                <slot name="leading">
                  <template v-if="item.isPlaceholder">
                    <USkeleton class="size-5" />
                  </template>
                  <template v-else-if="!item.isPlaceholder && item.isNote">
                    <FileIcon :name="item.label" :is-markdown="item.isMarkdown" />
                  </template>
                  <template v-else>
                    <UIcon v-if="expanded?.includes(item.apiPath)" name="i-lucide-book-open" class="size-5" />
                    <UIcon v-else name="i-lucide-book" class="size-5" />
                  </template>
                </slot>
                <slot name="label">
                  <div v-if="item.isPlaceholder">
                    <USkeleton class="mt-1.5 h-2 w-36" />
                  </div>
                  <div v-else>
                    <div class="text-left" :class="{ 'text-primary': currentNote === item.apiPath }">
                      {{ item.label }}
                    </div>
                    <div
                      v-if="!settingsStore.settings.isDense && item.isNote"
                      class="mt-0.5 flex flex-row gap-2 text-neutral-500 dark:text-neutral-400">
                      <small class="text-left">
                        {{ t('Updated') }}:
                        <CommonDateDisplay :date="item.updatedAt" />
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
                  :class="{ 'rotate-180': isOpen }" />
              </slot>
            </UButton>
            <NotebooksActions
              :is-open
              :notebook="item"
              class="target group-hover:bg-neutral-500/20"
              v-if="!item.isNote && !compact"></NotebooksActions>
            <NotesActions
              class="target group-hover:bg-neutral-500/20"
              :is-open
              :notebook="item"
              v-else-if="item.isNote && !compact"></NotesActions>
          </UFieldGroup>

          <TreeNotebooks
            v-if="item.children && isOpen"
            :compact
            v-model:current-note="currentNote"
            :items="item.children"
            :depth="depth + 1"
            @toggle="onToggle"></TreeNotebooks>
        </template>
      </TreeItem>
    </ul>
  </div>
</template>

<script lang="ts" setup>
const {
  items,
  depth = 0,
  compact = false
} = defineProps<{ items: NotebookTreeItemClient[]; depth?: number; compact?: boolean }>()

const { t } = useI18n()

const settingsStore = useSettingsStore()

const expanded = defineModel<string[]>('expanded', { required: false, default: [] })

const currentNote = defineModel<string>('currentNote', { required: false, default: null })

const emit = defineEmits<{
  (e: 'toggle', payload: NotebookTreeItemClient): void
}>()

const onToggle = (item: NotebookTreeItemClient) => {
  emit('toggle', item)
  const isCurrentlyExpanded = expanded.value.includes(item.apiPath)
  if (item.isNote) {
    currentNote.value = item.apiPath
    return
  }

  if (isCurrentlyExpanded) {
    expanded.value = expanded.value.filter((book) => book !== item.apiPath)
  } else {
    expanded.value = [...expanded.value, item.apiPath]
  }
}
</script>
