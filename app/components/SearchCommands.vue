<template>
  <UDashboardSearch
    v-if="!error"
    v-model:search-term="search"
    class="h-auto!"
    :title="t('search')"
    :placeholder="t('searchAll')"
    spellcheck="false"
    shortcut="meta_k"
    :groups="groups"
    :loading="searchStatus === 'pending'">
    <template #item-leading="{ item }">
      <FileIcon
        v-if="!item.icon"
        :name="item.label ?? ''"
        class="text-dimmed group-data-highlighted:not-group-data-disabled:text-default size-5 shrink-0 transition-colors" />
    </template>
    <template #footer>
      <div class="flex items-center justify-between gap-2">
        <CommonLogo class="text-dimmed ml-1 size-5" />
        <div class="flex items-center gap-1">
          <UButton color="neutral" variant="ghost" :label="t('open')" class="text-dimmed" size="xs">
            <template #trailing>
              <UKbd value="enter" />
            </template>
          </UButton>
          <USeparator orientation="vertical" class="h-4" />
          <UButton color="neutral" variant="ghost" :label="t('navigate')" class="text-dimmed" size="xs">
            <template #trailing>
              <UKbd value="arrowup" />
              <UKbd value="arrowdown" />
            </template>
          </UButton>
        </div>
      </div>
    </template>
  </UDashboardSearch>
  <UAlert
    v-else
    color="error"
    variant="outline"
    icon="i-lucide-circle-alert"
    :title="t('failure')"
    :description="error.data.message ?? error.message ?? error.statusMessage"
    as="div"
    class="mt-2" />
</template>

<script lang="ts" setup>
const { t } = useI18n()

const notebookStore = useNotebookStore()
const { search, searchStatus, error, groups } = useSearch(notebookStore.recentNotes)
</script>
