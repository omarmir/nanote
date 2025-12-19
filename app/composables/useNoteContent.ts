import { watchDebounced } from '@vueuse/core'
import { H3Error } from 'h3'
import { FetchError } from 'ofetch'
import type { Ref } from 'vue'

export interface UseNoteContentReturn {
  content: Ref<string>
  isMD: Ref<boolean | null>
  error: Ref<string | null>
  updated: Ref<Date | null>
  savingState: Ref<SavingState>
  loadingState: Ref<SavingState>
  note: string
  pathArray: string[]
  apiPath: string
  fetchMarkdown: () => Promise<void>
}

/**
 * Composable for managing note content fetching, streaming, and saving
 */
export const useNoteContent = (): UseNoteContentReturn => {
  const route = useRoute()
  const { t } = useI18n()

  // Type-safe extraction of route parameters
  const pathArray = Array.isArray(route.params.note)
    ? route.params.note
    : typeof route.params.note === 'string'
      ? [route.params.note]
      : []

  const note = pathArray.at(-1) ?? ''
  const apiPath = notePathArrayJoiner(pathArray)

  // Reactive state
  const content: Ref<string> = ref('')
  const isMD: Ref<boolean | null> = ref(null)
  const error: Ref<string | null> = ref(null)
  const updated: Ref<Date | null> = ref(null)
  const savingState: Ref<SavingState> = ref('idle')
  const loadingState: Ref<SavingState> = ref('idle')

  /**
   * Validates that required parameters are present
   */
  const validateParams = (): boolean => {
    if (!note || pathArray.length === 0) {
      error.value = t('errors.missingNotebookOrNote')
      savingState.value = 'error'
      return false
    }
    return true
  }

  /**
   * Fetches the note content from the API
   * Server route uses sendStream(), which sends data incrementally.
   * Native fetch gives direct access to the ReadableStream via response.body
   */
  const fetchNoteResponse = async (): Promise<Response> => {
    try {
      const response = await fetch(`/api/note/download/${apiPath}`)

      if (!response.body) throw createError({ message: t('errors.noResponseBody') })

      if (!response.ok) {
        console.error('HTTP error fetching note:', response.status, response.statusText)

        // Try to extract error message from response body
        let errorMessage = response.statusText
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.statusMessage || errorMessage || response.status
        } catch {
          // If response is not JSON, use statusText
        }

        throw createError({
          message: t('errors.failedFetchNote', { message: errorMessage })
        })
      }

      return response
    } catch (err) {
      console.error('Unable to fetch note response', err)
      throw createError({ message: t('errors.failedFetchNote', { message: (err as FetchError).message }) })
    }
  }

  /**
   * Extracts and sets metadata from response headers
   */
  const extractMetadata = (response: Response): { updated: Date | null; isMD: boolean } => {
    try {
      const dateUpdated = response.headers.get('Content-Updated')
      const updated = dateUpdated ? (new Date(dateUpdated).getTime() !== 0 ? new Date(dateUpdated) : null) : null

      const contentType = response.headers.get('Content-Type')
      const isMD = contentType === 'text/markdown'

      return { updated, isMD }
    } catch (err) {
      console.error('Unable to extract metadata:', err)
      const message = err instanceof Error ? err.message : String(err)
      throw createError({ message: t('errors.failedExtractMetadata', { message }) })
    }
  }

  /**
   * Reads the stream and appends content chunks to the ref
   */
  const readStreamContent = async (stream: ReadableStream<Uint8Array>): Promise<void> => {
    const reader = stream.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        if (value) {
          content.value += decoder.decode(value, { stream: true })
        }
      }

      // Flush any remaining bytes in the decoder
      const finalChunk = decoder.decode()
      if (finalChunk) {
        content.value += finalChunk
      }
    } catch (err) {
      console.error('Failed to read stream content:', err)

      // Check if it's a stream-specific error
      if (err instanceof TypeError && err.message.includes('lock')) {
        throw createError({ message: t('errors.streamLocked') })
      }

      // Handle abort/cancellation errors
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw createError({ message: t('errors.streamAborted') })
      }

      const message = err instanceof Error ? err.message : String(err)
      throw createError({ message: t('errors.failedReadContent', { message }) })
    } finally {
      // Ensure reader is always released, even if an error occurs
      try {
        reader.releaseLock()
      } catch (releaseErr) {
        // Reader might already be released or in an invalid state
        console.warn('Could not release reader lock:', releaseErr)
      }
    }
  }

  /**
   * Main function to orchestrate the fetching process
   */
  const fetchMarkdown = async (): Promise<void> => {
    savingState.value = 'pending'
    loadingState.value = 'pending'

    if (!validateParams()) {
      return
    }

    try {
      const response = await fetchNoteResponse()
      const metaData = extractMetadata(response)
      updated.value = metaData.updated
      isMD.value = metaData.isMD

      await readStreamContent(response.body!)
      savingState.value = 'success'
      error.value = null
      loadingState.value = 'success'
    } catch (err) {
      loadingState.value = 'error'
      console.error(err)
      savingState.value = 'error'
      error.value = (err as H3Error).message
    }
  }

  /**
   * Saves the note content to the server
   */
  const saveFile = async (markdownText: string) => {
    savingState.value = 'saving'
    const blob = new Blob([markdownText], { type: isMD.value ? 'text/markdown' : 'text/plain' })

    const formData = new FormData()
    formData.append('file', blob, note) // The file to upload
    formData.append('filename', note) // The filename to use when saving

    try {
      // @ts-expect-error PATCH is perfectly fine - no idea why its freaking out
      await $fetch(`/api/note/${apiPath}`, { method: 'PATCH', body: formData })
      savingState.value = 'success'
      error.value = null
    } catch (err) {
      const message = (err as FetchError).data?.message ?? (err as Error).message ?? String(err)
      error.value = t('errors.unableToSave', { message })
      savingState.value = 'error'
    }
  }

  // Watch content changes and trigger save
  watch(content, () => {
    savingState.value = 'pending'
  })

  watchDebounced(content, () => saveFile(content.value), { debounce: 500, maxWait: 5000 })

  return {
    content,
    isMD,
    error,
    updated,
    savingState,
    pathArray,
    note,
    apiPath,
    fetchMarkdown,
    loadingState
  }
}
