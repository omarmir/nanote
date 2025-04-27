<template>
  <div class="flex py-2">
    <button class="flex flex-row items-center gap-2 text-accent hover:text-accent-hover" @click="isOpen = true">
      <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m5 11h-4v4h-2v-4H7v-2h4V7h2v4h4z" />
      </svg>
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
                  <IconsNotebook class="size-5 text-accent"></IconsNotebook>
                  <span class="hidden lg:inline">Notebook?</span>
                </div>
              </template>
              <template #icon>
                <IconsAdd v-if="isNotebook"></IconsAdd>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M11 18h2v-3h3v-2h-3v-3h-2v3H8v2h3zm-7 4V2h10l6 6v14zm9-13V4H6v16h12V9zM6 4v5zv16z" />
                </svg>
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
