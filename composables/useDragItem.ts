import { ref } from 'vue'
import type { Note, Notebook } from '~/types/notebook'

export function useDragItem(item: MaybeRef<Note | Notebook>) {
  const isDragOver = ref(false)

  const isSameNotebook = (dropped: string) => {
    const thisBook = unref(item)
    console.log(thisBook)
    if (!dropped || !('path' in thisBook)) return false
    console.log('has')

    const droppedBook = JSON.parse(dropped) as Notebook

    if (droppedBook.path === thisBook.path) return true

    console.log(droppedBook.path)
    console.log(thisBook.path)
    return false
  }

  const onDragOver = (e: DragEvent) => {
    e.preventDefault()

    if (!e.dataTransfer) return

    const dropped = e.dataTransfer.getData('item')

    console.log(isSameNotebook(dropped))
    isDragOver.value = true
  }

  const onDragLeave = () => {
    isDragOver.value = false
  }
  const onDrop = (e: DragEvent) => {
    // TODO: Make sure its not itself when dropping
    isDragOver.value = false
    console.log('dropped', e.dataTransfer?.getData('item'))
    console.log('on', unref(item))
  }

  const onDragStart = (e: DragEvent) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('item', JSON.stringify(unref(item)))
    }
    console.log(e.dataTransfer?.getData('item'))
  }

  return {
    onDragLeave,
    onDragOver,
    onDrop,
    onDragStart,
    isDragOver
  }
}
