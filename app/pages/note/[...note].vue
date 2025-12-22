<template>
  <UDashboardPanel id="home">
    <template #header>
      <TopBar
        :name
        :note-opts="{ isReadOnly }"
        @readonly="toggleReadOnlyMode"
        @share="shareNote"
        @rename="renameNote"
        @delete="deleteNote" />
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
        <CommonEditor
          v-if="pathArray && isMD !== null"
          v-model:content="content"
          :api-path
          :is-m-d
          :disabled="isReadOnly"
          :note="name" />
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
import { LazyCommonDelete, LazyNotesRename, LazyNotesShare } from '#components'

const { t } = useI18n()
const overlay = useOverlay()
const isReadOnly = useState('isReadOnly', () => false)
const router = useRouter()

// Use the composable for all note content logic (including route extraction)
const { content, isMD, error, updated, savingState, pathArray, name, fetchMarkdown, apiPath, loadingState } =
  useNoteContent()

// Fetch markdown content on component setup
await fetchMarkdown()

const toggleReadOnlyMode = () => (isReadOnly.value = !isReadOnly.value)

const shareNote = () => overlay.create(LazyNotesShare).open({ name, apiPath })

const deleteNote = async () => {
  const deleteModal = overlay.create(LazyCommonDelete)
  const isDeleted = await deleteModal.open({ name, apiPath, pathArray, isNote: true })

  if (isDeleted) {
    router.push('/')
  }
}

const renameNote = async () => {
  const renameModal = overlay.create(LazyNotesRename)
  const renamed: boolean | string = await renameModal.open({
    originalName: name,
    originalAPIPath: apiPath,
    originalPathArray: pathArray,
    isMarkdown: isMD.value ?? false
  })

  if (renamed) {
    router.push(`/note/${renamed}`)
  }
}
</script>
