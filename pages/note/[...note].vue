<template>
  <div class="-mx-3 mb-5 flex flex-wrap">
    <div class="mb-6 w-full max-w-full px-3 sm:flex-none">
      <div class="flex flex-col gap-2 divide-y divide-gray-300 dark:divide-gray-700">
        <NoteName
          v-if="note"
          v-model="renamePending"
          :notebooks="notebooksArray"
          :name="note"
          :saving-state
          :is-focus
          :is-read-only
          @readonlymode="toggleReadOnlyMode()"
          @focusmode="toggleFocusMode()"></NoteName>
        <div class="flex flex-row items-center gap-4 py-2">
          <div v-if="updated" class="text-sm text-gray-500 dark:text-gray-300">
            {{
              updated.toLocaleString('en-CA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
              })
            }}
          </div>
          <CommonSavingIndicator :saving-state></CommonSavingIndicator>
        </div>
      </div>
      <CommonDangerAlert v-if="error" class="mb-4">{{ error }}</CommonDangerAlert>
      <MilkdownProvider v-if="note">
        <Milkdown v-model="md" :note :notebooks="notebooksArray" :disabled="renamePending || isReadOnly" :is-focus />
      </MilkdownProvider>
    </div>
  </div>
</template>
<script setup lang="ts">
import Milkdown from '~/components/MilkdownEditor.vue'
import { MilkdownProvider } from '@milkdown/vue'
import { watchDebounced } from '@vueuse/core'
import type { FetchError } from 'ofetch'
import type { SavingState } from '~/types/notebook'
const route = useRoute()
const note = route.params.note.at(-1)
const notebooksParams = route.params.note.slice(0, -1)
const notebooksArray = typeof notebooksParams === 'string' ? [notebooksParams] : notebooksParams
const notebookPath = notePathArrayJoiner(notebooksArray)

const isFocus = useState('isFocus', () => false)
const isReadOnly = useState('isReadOnly', () => false)
const renamePending = ref(false)
const error: Ref<string | null> = ref(null)

const md: Ref<string> = ref('')
const updated: Ref<Date | null> = ref(null)
const savingState: Ref<SavingState> = ref('success')

const fetchMarkdown = async () => {
  if (!note || !notebooksParams) {
    error.value = 'Notebook or note not specified'
  }

  try {
    /**
     * Server route uses sendStream(), which sends data incrementally. To consume this properly in the client:
     * Native fetch gives direct access to the ReadableStream via response.body
     * $fetch/useFetch abstract the stream away, trying to parse the entire response at once (not ideal for chunks)
     */
    const response = await fetch(`/api/note/download/${notebookPath}/${note}`)

    if (!response.body) throw new Error('No response body')

    console.log()

    const dateUpdated = response.headers.get('Content-Updated')
    if (dateUpdated) {
      updated.value = new Date(dateUpdated).getTime() !== 0 ? new Date(dateUpdated) : null
    }

    // Create a reader for the stream
    const reader = response.body.getReader()
    // Decode the Uint8Array chunks to text
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      // Append each chunk to the ref value
      md.value += decoder.decode(value)
    }
  } catch (err) {
    console.error('Download failed:', err)
    error.value = `Error fetching markdown: ${err}`
  }
}

// Call when needed (e.g., in onMounted or click handler)
await fetchMarkdown()

watch(md, () => {
  savingState.value = 'pending'
})

watchDebounced(md, () => saveFile(md.value), { debounce: 500, maxWait: 5000 })

const saveFile = async (markdownText: string) => {
  savingState.value = 'saving'
  const blob = new Blob([markdownText], { type: 'text/markdown' })

  const formData = new FormData()
  formData.append('file', blob, `${note}.md`) // The file to upload
  formData.append('filename', `${note}.md`) // The filename to use when saving

  try {
    //@ts-expect-error PATH is available but likely mismatched due to dynamic URL
    await $fetch(`/api/note/${notebookPath}/${note}`, { method: 'PATCH', body: formData })
    savingState.value = 'success'
    error.value = null
  } catch (err) {
    error.value = `Unable to save: ${(err as FetchError).data.message}`
    savingState.value = 'error'
  }
}

setPageLayout(isFocus.value ? 'focus' : 'default')

const toggleFocusMode = () => {
  isFocus.value = !isFocus.value
  setPageLayout(isFocus.value ? 'focus' : 'default')
}

const toggleReadOnlyMode = () => (isReadOnly.value = !isReadOnly.value)
</script>
