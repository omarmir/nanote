<template>
  <div>
    <div class="-mx-3 mb-5 flex flex-wrap">
      <div class="mb-6 w-full max-w-full px-3 sm:flex-none">
        <div class="flex flex-col gap-2 divide-y divide-gray-300 dark:divide-gray-700">
          <h1 class="w-full bg-transparent text-5xl text-gray-900 focus:italic focus:outline-none dark:text-gray-200">
            {{ name }}
          </h1>
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
          </div>
        </div>
        <CommonDangerAlert v-if="error" class="mb-4">{{ error }}</CommonDangerAlert>
        <MilkdownProvider v-if="isMD === true && md">
          <Milkdown v-model="md" :disabled="true" />
        </MilkdownProvider>
        <NuxtCodeMirror
          v-else-if="isMD === false && md"
          :key="isDark.toString()"
          ref="codemirror"
          v-model="md"
          :theme="isDark ? 'dark' : 'light'"
          class="file-editor mt-4 w-full"
          placeholder="Enter your content here..."
          :auto-focus="true"
          :line-wrapping="true"
          :editable="false"
          :basic-setup="true"
          :extensions="[EditorView.lineWrapping]"
          :indent-with-tab="true" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import Milkdown from '~/components/MilkdownEditor.vue'
import { MilkdownProvider } from '@milkdown/vue'
import { useDark } from '@vueuse/core'
import { EditorView } from '@codemirror/view'

setPageLayout('focus')
const route = useRoute()
const key = route.params.key as string
const name: Ref<string | null> = ref(null)
const error: Ref<string | null> = ref(null)
const updated: Ref<Date | null> = ref(null)
const md: Ref<string> = ref('')
const isLoading: Ref<boolean> = ref(true)
const isMD: Ref<boolean | null> = ref(null)
const isDark = useDark()

const fetchMarkdown = async () => {
  if (!key || typeof key !== 'string') {
    error.value = 'Share key not specified'
  }

  try {
    /**
     * Server route uses sendStream(), which sends data incrementally. To consume this properly in the client:
     * Native fetch gives direct access to the ReadableStream via response.body
     * $fetch/useFetch abstract the stream away, trying to parse the entire response at once (not ideal for chunks)
     */
    const response = await fetch(`/api/share/${key}`)

    if (!response.body) throw new Error('No response body')

    const dateUpdated = response.headers.get('Content-Updated')
    if (dateUpdated) {
      updated.value = new Date(dateUpdated).getTime() !== 0 ? new Date(dateUpdated) : null
    }

    const nameHeader = response.headers.get('Content-Disposition')
    const nameMatch = nameHeader?.match(/filename="([^"]+)"/)
    if (nameMatch) {
      const { name: noteName } = nameMatch[1] ? getFileNameAndExtension(nameMatch[1]) : { name: key }
      name.value = noteName
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
  } catch (err) {
    console.error('Download failed:', err)
    error.value = `Error fetching markdown: ${err}`
  }
}

// Call when needed (e.g., in onMounted or click handler)
const startDownloadNote = async () => {
  isLoading.value = true
  await fetchMarkdown()
  isLoading.value = false
}

startDownloadNote()
</script>
