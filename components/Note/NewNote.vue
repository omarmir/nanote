<template>
  <div class="flex">
    <button class="flex flex-row items-center gap-2 text-accent hover:text-accent-hover" @click="isOpen = true">
      <Icon name="lucide:circle-plus" />
      Add
    </button>
    <Teleport to="body">
      <CommonBaseDialog v-model="isOpen" title="New" :desc="`Add note or notebook inside ${notebook.name}`">
        <template v-if="!isManualFile" #desc>
          Add note or notebook inside
          <span class="font-bold text-teal-600">{{ notebook.name }}</span>
        </template>
        <template v-else #desc>
          Add file manually with the file extension inside
          <span class="font-bold text-teal-600">{{ notebook.name }}</span>
        </template>
        <template #action>
          <CommonToggleBox v-model="isManualFile">Manual</CommonToggleBox>
        </template>
        <form class="w-full grow" @submit.prevent="addItem">
          <label for="search" class="sr-only mb-2 text-sm font-medium text-gray-900">Note</label>
          <div v-if="!isManualFile" class="w-full">
            <CommonToggleInput
              v-model="newItem"
              v-model:toggle="isNotebook"
              name="is-notebook"
              placeholder="Name"
              title="Notebook?">
              <template #label>
                <div class="flex flex-row flex-nowrap gap-2">
                  <Icon name="lucide:book" class="text-accent"></Icon>
                  <span class="hidden lg:inline">Notebook?</span>
                </div>
              </template>
              <template #icon>
                <Icon v-if="isNotebook" name="lucide:book-plus" />
                <Icon v-else name="lucide:file-plus" />
              </template>
            </CommonToggleInput>
          </div>
          <div v-else class="w-full">
            <CommonButtonInput
              v-model="newItem"
              name="file-name"
              placeholder="Full file name with the extension"
              title="Name">
              <template #label>
                <span class="hidden text-sm font-bold">File name</span>
              </template>
              <template #icon>
                <Icon name="lucide:file-plus" />
              </template>
            </CommonButtonInput>
          </div>
          <CommonDangerAlert v-if="error" class="mb-0 mr-4 mt-2">{{ error }}</CommonDangerAlert>
        </form>
      </CommonBaseDialog>
    </Teleport>
  </div>
</template>
<script lang="ts" setup>
import type { Note, Notebook } from '~/types/notebook'
import type { Result } from '~/types/result'
const { notebook } = defineProps<{ notebook: Notebook }>()
const router = useRouter()
const noteBookStore = useNotebookStore()
const isOpen = ref(false)
const newItem: Ref<string | null> = ref('')
const isNotebook: Ref<boolean> = ref(false)
const error: Ref<string | null> = ref(null)
const isManualFile: Ref<boolean> = ref(false)
const addItem = async () => {
  if (!newItem.value) {
    error.value = 'Name is required.'
    return
  }

  const resp: Result<Note | Notebook> =
    isNotebook.value && !isManualFile.value
      ? await noteBookStore.addNotebook(newItem.value, notebook)
      : await noteBookStore.addNote(notebook, newItem.value, isManualFile.value)

  if (!resp.success) {
    error.value = resp.message
    return
  }

  newItem.value = null
  error.value = null
  isOpen.value = false

  if (!isNotebook.value) {
    const newNote = resp.data as Note
    const url = `/note/${notePathArrayJoiner(newNote.notebook)}/${newNote.name}`
    router.push(url)
  }

  isNotebook.value = false
}
</script>
