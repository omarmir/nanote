<template>
  <div class="flex flex-col">
    <ul v-for="item in items">
      <TreeItem :item :expanded class="flex w-full flex-col place-content-center">
        <template #default="{ isOpen }">
          <UButton
            @click="onToggle(item)"
            class="flex flex-row items-center justify-between"
            :variant="isOpen ? 'soft' : 'ghost'"
            :color="isOpen ? 'primary' : 'neutral'"
            :ui="{
              base: 'hover:text-primary'
            }">
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
                  <div class="text-left">{{ item.label }}</div>
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
            @toggle="onToggle"
            v-if="item.children && isOpen"
            :items="item.children"
            class="ml-8"></TreeNotebooks>
        </template>
      </TreeItem>
    </ul>
  </div>
</template>
<script lang="ts" setup>
const { items } = defineProps<{ items: NotebookTreeItemClient[] }>()

const { t } = useI18n()

const settingsStore = useSettingsStore()

const expanded = defineModel<string[]>({ required: false, default: [] })

const emit = defineEmits<{
  (e: 'toggle', payload: NotebookTreeItemClient): void
}>()

const onToggle = (item: NotebookTreeItemClient) => {
  emit('toggle', item)
  if (expanded.value.includes(item.apiPath)) {
    expanded.value = expanded.value.filter((book) => book !== item.apiPath)
  } else {
    expanded.value = [...expanded.value, item.apiPath]
  }
}
</script>
