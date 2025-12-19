<template>
  <UDashboardPanel id="home">
    <template #header>
      <TopBar :name="note" />
    </template>
    <template #body>
      <Suspense>
        <div class="flex flex-row items-center gap-4">
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
          <UIcon
            v-if="savingState === 'pending'"
            name="i-lucide-loader-circle"
            class="text-warning animate-spin"></UIcon>
          <UIcon v-if="savingState === 'success'" name="i-lucide-circle-check" class="text-primary"></UIcon>
        </div>
      </Suspense>
      <Suspense>
        <CommonEditor
          v-if="notebookPath && isMD !== null"
          :notebooks-array
          :is-m-d
          :disabled="false"
          :note
          v-model:content="md"></CommonEditor>
        <template #fallback>
          <div class="ml-[60px] flex w-full flex-col gap-2">
            <USkeleton class="mb-4 h-8 w-2/5"></USkeleton>
            <USkeleton class="h-3 w-2/5"></USkeleton>
            <USkeleton class="h-3 w-4/5"></USkeleton>
            <USkeleton class="h-3 w-3/5"></USkeleton>
            <USkeleton class="h-3 w-1/5"></USkeleton>
          </div>
        </template>
      </Suspense>
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'
import type { FetchError } from 'ofetch'

const route = useRoute()
const notebookPath = route.params.note
const { t } = useI18n()

const note = notebookPath?.at(-1) ?? ''
const notebooksParams = notebookPath?.slice(0, -1) ?? ''
const isMD: Ref<boolean | null> = ref(null)
const error: Ref<string | null> = ref(null)
const md: Ref<string> = ref('')
const updated: Ref<Date | null> = ref(null)
const savingState: Ref<SavingState> = ref('idle')

const isReadOnly = useState('isReadOnly', () => false)

const notebooksArray = typeof notebooksParams === 'string' ? [notebooksParams] : notebooksParams
const notebookAPIPath = notePathArrayJoiner([...notebooksArray, note])

const fetchMarkdown = async () => {
  savingState.value = 'pending'
  if (!note || !notebooksParams) {
    error.value = 'Notebook or note not specified'
  }

  try {
    /**
     * Server route uses sendStream(), which sends data incrementally. To consume this properly in the client:
     * Native fetch gives direct access to the ReadableStream via response.body
     * $fetch/useFetch abstract the stream away, trying to parse the entire response at once (not ideal for chunks)
     */
    const response = await fetch(`/api/note/download/${notebookAPIPath}`)

    if (!response.body) throw new Error('No response body')

    console.log()

    const dateUpdated = response.headers.get('Content-Updated')
    if (dateUpdated) {
      updated.value = new Date(dateUpdated).getTime() !== 0 ? new Date(dateUpdated) : null
    }

    const contentType = response.headers.get('Content-Type')
    if (contentType) {
      isMD.value = contentType === 'text/markdown'
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
    savingState.value = 'success'
  } catch (err) {
    console.error('Download failed:', err)
    error.value = `${err}`
  }
}

// Call when needed (e.g., in onMounted or click handler)
await fetchMarkdown()

watch(md, () => {
  console.log('watch')
  savingState.value = 'pending'
})

watchDebounced(md, () => saveFile(md.value), { debounce: 500, maxWait: 5000 })

const saveFile = async (markdownText: string) => {
  savingState.value = 'saving'
  const blob = new Blob([markdownText], { type: isMD.value ? 'text/markdown' : 'text/plain' })

  const formData = new FormData()
  formData.append('file', blob, note) // The file to upload
  formData.append('filename', note) // The filename to use when saving

  try {
    // @ts-expect-error PATCH is perfectly fine - no idea why its freaking out
    await $fetch(`/api/note/${notebookAPIPath}`, { method: 'PATCH', body: formData })
    savingState.value = 'success'
    error.value = null
  } catch (err) {
    error.value = `Unable to save: ${(err as FetchError).data.message}`
    savingState.value = 'error'
  }
}

const toggleReadOnlyMode = () => (isReadOnly.value = !isReadOnly.value)
</script>
