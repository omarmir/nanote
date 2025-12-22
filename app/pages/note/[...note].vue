<template>
  <UDashboardPanel id="home">
    <template #header>
      <TopBar :name="note" :note-opts="{ isReadOnly: false }" @readonly="toggleReadOnlyMode" />
    </template>
    <template #body>
      <UAlert v-if="error" class="mb-4" color="error" variant="outline">
        <template #title>
          {{ t('failure') }}
        </template>
        <template #description>
          {{ error }}
        </template>
      </UAlert>
      <template v-if="loadingState === 'success'">
        <NotesMeta :updated :saving-state />
        <CommonEditor v-if="pathArray && isMD !== null" v-model:content="content" :api-path :is-m-d :disabled="false" :note />
      </template>
      <template v-else-if="loadingState === 'pending'">
        <div class="ml-[60px] flex w-full flex-col gap-2">
          <USkeleton class="mb-4 h-8 w-2/5" />
          <USkeleton class="h-3 w-2/5" />
          <USkeleton class="h-3 w-4/5" />
          <USkeleton class="h-3 w-3/5" />
          <USkeleton class="h-3 w-1/5" />
        </div>
      </template>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
const { t } = useI18n()

const isReadOnly = useState('isReadOnly', () => false)

// Use the composable for all note content logic (including route extraction)
const { content, isMD, error, updated, savingState, pathArray, note, fetchMarkdown, apiPath, loadingState } = useNoteContent()

// Fetch markdown content on component setup
await fetchMarkdown()

const toggleReadOnlyMode = () => (isReadOnly.value = !isReadOnly.value)
</script>
