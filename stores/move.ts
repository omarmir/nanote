import { defineStore } from 'pinia'
import type { Note, Notebook, SavingState } from '~/types/notebook'

export const useMoveStore = defineStore('move', () => {
  const currentMovementItem: Ref<Note | Notebook | null> = ref(null)
  const status: Ref<SavingState> = ref('idle')
  const error: Ref<string | null> = ref(null)
  const currentDragOverItem: Ref<Notebook | null> = ref(null)

  const clearStatus = () => {
    status.value = 'idle'
    error.value = null
    currentMovementItem.value = null
    currentDragOverItem.value = null
  }

  const setError = (msg: string) => {
    status.value = 'error'
    error.value = msg
    setTimeout(() => clearStatus(), 10000)
  }

  const onDragOver = (e: DragEvent, notebook: Notebook) => {
    e.preventDefault()
    if (!currentMovementItem.value) return

    if ('path' in currentMovementItem.value) {
      if (sameNotebook(notebook, currentMovementItem.value)) return
    } else {
      if (noteInSameNotebook(currentMovementItem.value, notebook)) return
    }
    currentDragOverItem.value = notebook
  }

  const onDragLeave = () => {
    currentDragOverItem.value = null
  }

  const onDragStart = (e: DragEvent, item: Note | Notebook) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('item', JSON.stringify(item.name))
      e.dataTransfer.effectAllowed = 'move'
    }
    currentMovementItem.value = item
  }

  const onDragEnd = (e: DragEvent) => {
    currentMovementItem.value = null
    currentDragOverItem.value = null

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'none' // Explicitly set to none when leaving
    }

    setTimeout(() => {
      document.body.style.cursor = 'auto'
    }, 50) // Try 50ms, or even 100ms if needed
  }

  const onDrop = async (e: DragEvent, notebook: Notebook) => {
    if (!e.dataTransfer) return
    console.log(notebook)

    clearStatus()
  }

  return {
    setError,
    onDragOver,
    onDragLeave,
    onDragStart,
    onDragEnd,
    status,
    error,
    onDrop,
    currentDragOverItem,
    currentMovementItem
  }
})
