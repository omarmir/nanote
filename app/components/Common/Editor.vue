<template>
  <div class="mb-5 flex flex-wrap sm:mx-[60px]">
    <div class="mb-6 w-full max-w-full px-3 sm:flex-none">
      <div class="flex flex-col gap-2 divide-y divide-gray-300 dark:divide-gray-700">
        <NotesName
          v-if="note"
          v-model="renamePending"
          :notebooks="notebooksArray"
          :name="note"
          :saving-state
          :is-focus
          :is-read-only
          @readonlymode="toggleReadOnlyMode()"></NotesName>
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
          <UIcon
            v-if="savingState === 'pending'"
            name="i-lucide-loader-circle"
            class="text-warning animate-spin"></UIcon>
          <UIcon v-if="savingState === 'success'" name="i-lucide-circle-check" class="text-primary"></UIcon>
        </div>
      </div>
      <UAlert v-if="error" class="mb-4">
        <template #title>
          {{ t('failure') }}
        </template>
        <template #description>
          {{ error }}
        </template>
      </UAlert>
      <MilkdownProvider v-if="isMD && settingsStore.settings.isCodeViewAllFiles !== true && !error">
        <MilkdownEditor
          v-model="md"
          :note
          :ln
          :notebooks="notebooksArray"
          :disabled="renamePending || isReadOnly"
          :is-focus />
      </MilkdownProvider>
      <NuxtCodeMirror
        v-else-if="(!isMD || settingsStore.settings.isCodeViewAllFiles) && !error"
        :key="isDark.toString()"
        ref="codemirror"
        v-model="md"
        :theme="isDark ? 'dark' : 'light'"
        class="file-editor mt-4 w-full"
        :placeholder="t('contentHere')"
        :auto-focus="true"
        :line-wrapping="true"
        :editable="true"
        :basic-setup="true"
        :extensions="[EditorView.lineWrapping]"
        :indent-with-tab="true"
        @on-create-editor="({ view, state }: { view: EditorView; state: EditorState }) => cmCreated(view, state)" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { MilkdownProvider } from '@milkdown/vue'
import { watchDebounced } from '@vueuse/core'
import type { FetchError } from 'ofetch'
import { EditorView } from '@codemirror/view'
import { useRouter } from 'vue-router'
import type { EditorState } from '@codemirror/state'

const router = useRouter()
const settingsStore = useSettingsStore()

const queryParams = router.currentRoute.value.query
const colorMode = useColorMode()

const { notebookPath } = defineProps<{ notebookPath: string | string[] }>()

const { t } = useI18n()

const isMD: Ref<boolean | null> = ref(null)
const isDark = computed(() => colorMode.value === 'dark')
const note = notebookPath.at(-1) ?? ''
const notebooksParams = notebookPath.slice(0, -1)
const notebooksArray = typeof notebooksParams === 'string' ? [notebooksParams] : notebooksParams
const notebookAPIPath = notePathArrayJoiner([...notebooksArray, note])

const isFocus = useState('isFocus', () => false)
const isReadOnly = useState('isReadOnly', () => false)
const renamePending = ref(false)
const error: Ref<string | null> = ref(null)

const md: Ref<string> = ref('')
const updated: Ref<Date | null> = ref(null)
const savingState: Ref<SavingState> = ref('idle')
const ln: number | undefined = queryParams.ln && Number.isInteger(+queryParams.ln) ? +queryParams.ln : undefined

const cmCreated = (view: EditorView, state: EditorState) => {
  if (ln && Number.isInteger(+ln)) {
    const line = state.doc.line(+ln)

    view.dispatch({
      selection: { head: line.from, anchor: line.to }
    })
    setTimeout(() => {
      const { top } = view.lineBlockAt(line.from)
      window.scrollTo({
        top,
        left: 0,
        behavior: 'smooth'
      })
    }, 2)
  }
}

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
<style lang="postcss">
.file-editor .cm-editor {
  @apply bg-transparent !important;
}

.file-editor .cm-focused {
  @apply outline-none;
}

.file-editor .cm-activeLine {
  @apply bg-accent/10! dark:bg-accent/20!;
}

.file-editor .cm-line {
  @apply text-base;
}
</style>
