<template>
  <div class="-mx-3 mb-5 flex flex-wrap">
    <div class="mb-6 w-full max-w-full px-3 sm:flex-none">
      <div class="flex flex-col gap-2 divide-y divide-gray-300 dark:divide-gray-700">
        <NoteName
          v-model="renamePending"
          :notebook="notebook"
          :name="note"
          :saving-state
          :is-focus
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
      <MilkdownProvider>
        <Milkdown v-model="md" :disabled="renamePending" />
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
const notebook = typeof route.params.notebook === 'string' ? route.params.notebook : route.params.notebook[0]
const note = typeof route.params.note === 'string' ? route.params.note : route.params.note[0]
const isFocus = useState('isFocus', () => false)

const renamePending = ref(false)
const error: Ref<string | null> = ref(null)

const md: Ref<string> = ref('')
const updated: Ref<Date | null> = ref(null)
const savingState: Ref<SavingState> = ref('success')

const fetchMarkdown = async () => {
  if (!note || !notebook) {
    error.value = 'Notebook or note not specified'
  }

  try {
    /**
     * Server route uses sendStream(), which sends data incrementally. To consume this properly in the client:
     * Native fetch gives direct access to the ReadableStream via response.body
     * $fetch/useFetch abstract the stream away, trying to parse the entire response at once (not ideal for chunks)
     */
    const response = await fetch(`/api/${notebook}/${note}/download`)

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
  formData.append('file', blob, 'example.md') // The file to upload
  formData.append('filename', 'example.md') // The filename to use when saving

  try {
    await $fetch(`/api/${notebook}/${note}`, { method: 'PATCH', body: formData })
    savingState.value = 'success'
  } catch (err) {
    error.value = `Unable to save: ${(err as FetchError).data.message}`
    savingState.value = 'error'
  }
}

const toggleFocusMode = () => {
  isFocus.value = !isFocus.value
  setPageLayout(isFocus.value ? 'focus' : 'default')
}
</script>
