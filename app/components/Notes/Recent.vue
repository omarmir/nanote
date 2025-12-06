<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">{{ t('recentNotes') }}</h1>
    <ul v-if="notes" class="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <li v-for="note in notes" :key="note.apiPath" class="flex">
        <UCard class="flex-1">
          <h3 class="flex flex-row items-center gap-x-2 font-bold">
            <FileIcon :name="note.name" :is-markdown="note.isMarkdown"></FileIcon>
            <span v-if="note.isMarkdown">
              {{ note.name.replace(/\.[^.]+$/, '') }}
            </span>
            <span v-else>
              {{ note.name }}
            </span>
          </h3>
          <div class="mt-1 flex flex-col gap-2 text-neutral-500">
            <small>
              {{ t('Updated') }}
              <CommonDateDisplay :date="note.updatedAt"></CommonDateDisplay>
            </small>
            <small v-if="note.preview">
              <Suspense v-if="note.isMarkdown">
                <CommonMarkdown :content="note.preview"></CommonMarkdown>
              </Suspense>
            </small>
            <small v-else class="whitespace-pre-line">{{ note.preview }}</small>
          </div>
        </UCard>
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
const { t } = useI18n()
const { data: notes } = await useFetch<Note[]>('/api/notes', {
  immediate: true,
  lazy: true,
  query: { display: 4 }
})
</script>
