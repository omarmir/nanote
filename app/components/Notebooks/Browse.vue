<template>
  <UModal v-model:open="open" :close="{ onClick: () => emit('close', false) }" :description="name" :title="t('browse')">
    <template #default>
      <slot name="trigger" />
    </template>
    <template #body>
      <TreeNotebooks v-if="contents" :items="contents" type="root" @toggle="onToggle" />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const { name, pathArray, apiPath } = defineProps<{
  name: string
  pathArray: string[]
  apiPath: string
}>()

const { t } = useI18n()

const open = ref(false)
const emit = defineEmits<{ close: [boolean] }>()

const cancelBrowse = async () => emit('close', false)

const { data: contents } = await useFetch<NotebookTreeItem[]>(`/api/notebook/${apiPath}`, {
  deep: true,
  immediate: true
})

const onToggle = (item: NotebookTreeItemClient) => {
  if (!contents.value) return
  const relativePathArray = removeSequentialMatch(pathArray, item.pathArray)
  toggleNotebook({ ...item, pathArray: relativePathArray }, contents.value)
}
</script>
