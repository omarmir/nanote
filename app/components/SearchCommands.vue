<template>
  <UDashboardSearch
    class="h-auto!"
    v-model:search-term="search"
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
        <CommonLogo class="text-dimmed ml-1 size-5"></CommonLogo>
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
</template>
<script lang="ts" setup>
import type { dashboardSearch } from '#build/ui'

const { t } = useI18n()

const notebookStore = useNotebookStore()
const { search, searchStatus, error, groups } = useSearch(notebookStore.recentNotes)

console.log(groups)
</script>
