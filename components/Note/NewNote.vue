<template>
  <div class="flex">
    <button class="flex flex-row items-center gap-2 text-accent hover:text-accent-hover" @click="isOpen = true">
      <Icon name="lucide:circle-plus" />
      Add
    </button>
    <Teleport to="body">
      <CommonBaseDialog v-model="isOpen" title="New" :desc="`Add note or notebook inside ${notebook.name}`">
        <template #desc>
          Add note or notebook inside
          <span class="font-bold text-teal-600">{{ notebook.name }}</span>
        </template>
        <form class="w-full grow" @submit.prevent="addItem">
          <label for="search" class="sr-only mb-2 text-sm font-medium text-gray-900">Note</label>
          <div class="w-full">
            <CommonToggleInput v-model="newItem" v-model:toggle="isNotebook" placeholder="Name" title="Notebook?">
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

const addItem = async () => {
  if (!newItem.value) {
    error.value = 'Name is required.'
    return
  }

  const resp: Result<Note | Notebook> = isNotebook.value
    ? await noteBookStore.addNotebook(newItem.value, notebook)
    : await noteBookStore.addNote(notebook, newItem.value)

  if (!resp.success) {
    error.value = resp.message
    return
  }

  newItem.value = null
  isNotebook.value = false
  error.value = null
  isOpen.value = false

  if (!isNotebook.value) {
    const newNote = resp.data as Note
    const url = `/note/${notePathArrayJoiner(newNote.notebook)}/${newNote.name}`
    router.push(url)
  }
}
</script>
