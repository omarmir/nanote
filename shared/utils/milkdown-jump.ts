import { TextSelection } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'

export function jumpToMarkdownLine(view: EditorView, markdown: string, lineNumber: number): boolean {
  if (!view || !view.state) return false
  const lines = markdown.split('\n')
  if (lineNumber < 1 || lineNumber > lines.length) return false

  // Calculate the character offset in the markdown source
  const charOffset = lines.slice(0, lineNumber - 1).reduce((sum, l) => sum + l.length + 1, 0)
  // Map markdown offset to ProseMirror position
  let found = false
  let pmPos = 0
  let charCount = 0
  view.state.doc.descendants((node, pos) => {
    if (found) return false
    if (node.isText) {
      const nextCharCount = charCount + node.text!.length
      if (nextCharCount >= charOffset) {
        pmPos = pos + (charOffset - charCount)
        found = true
        return false
      }
      charCount = nextCharCount
    }
    return true
  })

  if (!found) {
    // Fallback: jump to end
    pmPos = view.state.doc.content.size
  }

  // Validate and adjust pmPos
  const resolvedPos = view.state.doc.resolve(pmPos)

  view.focus()
  // Set selection at the valid position
  const tr = view.state.tr.setSelection(TextSelection.create(view.state.doc, resolvedPos.pos))
  // const tr = view.state.tr.setSelection(NodeSelection.create(view.state.doc, resolvedPos.start(resolvedPos.depth)))
  view.dispatch(tr)

  const selectionCoords = view.coordsAtPos(resolvedPos.pos)

  // The 'top' property gives you the Y coordinate relative to the window.
  const top = selectionCoords.top

  window.scrollTo({
    top,
    left: 0,
    behavior: 'smooth'
  })

  setTimeout(() => view.focus(), 2)

  return true
}
