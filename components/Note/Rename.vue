<template>
  <button
    v-if="isRenaming"
    :disabled="renamePending"
    class="flex flex-row items-center gap-2 text-gray-900 hover:text-accent-hover disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:text-gray-100 dark:text-gray-400 dark:hover:text-accent disabled:dark:hover:text-gray-400"
    @click="renameNote">
    <Icon v-if="renamePending" name="lucide:loader-circle" class="size-6 animate-spin text-amber-500" />
    <Icon v-else name="gg:rename" class="size-6"></Icon>
    Rename
  </button>
</template>
<script lang="ts" setup>
const { name, notebooks } = defineProps<{ name: string; notebooks: string[] }>()

const notebookStore = useNotebookStore()
const renamePending = ref(false)
const error: Ref<string | null> = ref(null)
const { extension } = getFileNameAndExtension(name)

const model = defineModel<string>({ required: true })

const renameNote = async () => {
  renamePending.value = true
  const resp = await notebookStore.renameNote(notebooks, name, `${model.value}.${extension}`)
  if (resp.success) {
    error.value = null
    navigateTo(resp.data.newName)
    renamePending.value = false
  } else {
    error.value = resp.message
  }
}

const isRenaming = computed(() => name !== `${model.value}.${extension}`)
</script>
