import { ref } from 'vue'
import type { Note, Notebook, SavingState } from '~/types/notebook'
import type { Result } from '~/types/result'

export function useDragItem(
  item: MaybeRef<Note | Notebook>,
  callback?: (dropped: Note | Notebook, on: Notebook) => Promise<Result<boolean>>
) {
  const isDragOver = ref(false)
  const status: Ref<SavingState> = ref('idle')
  const error: Ref<string | null> = ref(null)

  const onDragOver = (e: DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
    isDragOver.value = true
  }

  const onDragLeave = () => {
    isDragOver.value = false
  }

  const onDrop = async (e: DragEvent) => {
    isDragOver.value = false
    const thisItem = unref(item)
    if (!e.dataTransfer) return
    const dropped = JSON.parse(e.dataTransfer?.getData('item'))
    if (!('path' in thisItem)) return // Notebooks have path, notes don't

    if (!callback) return

    status.value = 'pending'
    const result = await callback(dropped, thisItem)
    if (!result.success) {
      error.value = result.message
      status.value = 'error'
    } else {
      status.value = 'success'
    }
  }

  const onDragStart = (e: DragEvent) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('item', JSON.stringify(unref(item)))
      e.dataTransfer.effectAllowed = 'move'
    }
  }

  const onDragEnd = (e: DragEvent) => {
    isDragOver.value = false
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'none' // Explicitly set to none when leaving
    }
    setTimeout(() => {
      document.body.style.cursor = 'auto'
    }, 50) // Try 50ms, or even 100ms if needed
  }

  return {
    onDragLeave,
    onDragOver,
    onDrop,
    onDragStart,
    isDragOver,
    status,
    error,
    onDragEnd
  }
}
