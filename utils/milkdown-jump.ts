import { TextSelection } from '@milkdown/prose/state'
import type { Node } from '@milkdown/prose/model' // Correct import for Node
import type { EditorView } from '@milkdown/prose/view' // Import EditorView from ProseMirror

export function jumpToMilkdownBlockLine(view: EditorView, lineNumberProvided: number): boolean {
  const lineNumber = Math.ceil(lineNumberProvided / 2)
  if (lineNumber < 1) {
    console.warn('jumpToMilkdownBlockLine: Line number must be 1 or greater.')
    return false
  }

  // No need for a `success` flag initialized here, it's determined at the end.

  if (!view || !view.state) {
    // Added check for view.state as well for robustness
    console.error('jumpToMilkdownBlockLine: EditorView or its state not available.')
    return false
  }

  const doc = view.state.doc
  let blockCount = 0
  let targetProseMirrorPos = 0 // Position to jump to
  let foundTarget = false // Flag to explicitly indicate if the target was found

  doc.descendants((node: Node, pos: number) => {
    // If the target has already been found, stop iterating.
    if (foundTarget) {
      return false
    }

    // Check if the current node is a block node (e.g., paragraph, heading, list_item)
    if (node.isBlock) {
      blockCount++
      if (blockCount === lineNumber) {
        // Found the target block node.
        // The `pos` argument in `descendants` is the start position of the node.
        // We want to jump *inside* the block, so add 1 to get to the start of its content.
        targetProseMirrorPos = pos + 1
        foundTarget = true // Mark as found
        return false // Return false to stop iteration once the target is found
      }
    }
    return true // Return true to continue iteration
  })

  if (foundTarget && targetProseMirrorPos > 0) {
    // Only dispatch if the target was actually found
    // Create a new TextSelection at the calculated position
    const tr = view.state.tr.setSelection(TextSelection.create(doc, targetProseMirrorPos))
    // Dispatch the transaction to update the editor's state and cursor
    view.dispatch(tr)
    view.focus() // Ensure the editor is focused after the jump
    console.log(`Jumped to block line ${lineNumber} at ProseMirror position ${targetProseMirrorPos}`)
    return true
  } else {
    console.warn(
      `jumpToMilkdownBlockLine: Could not find block line ${lineNumber}. Document has ${blockCount} block lines.`
    )
    // As a fallback, if the line is not found (e.g., out of bounds), focus the editor
    // and move the cursor to the end of the document.
    view.focus()
    const endPos = view.state.doc.content.size
    const tr = view.state.tr.setSelection(TextSelection.create(view.state.doc, endPos))
    view.dispatch(tr)
    return false
  }
}

export const jump = (view: EditorView, targetLineNumber: number) => {
  let lineCounter = 1
  let pos = 0
  view.state.doc.forEach((node) => {
    // Check if the node is a block node (e.g., paragraph, heading)
    if (node.isBlock) {
      if (lineCounter === targetLineNumber) {
        // Set the cursor at the start of the target line's content
        pos += 1 // Move past the block's opening tag
        return false // Stop iterating
      }
      lineCounter = lineCounter + 2
    }
    pos += node.nodeSize
  })

  // If the calculated position is valid, set the selection
  if (pos > 0 && pos <= view.state.doc.content.size) {
    const tr = view.state.tr.setSelection(TextSelection.create(view.state.doc, pos))
    view.dispatch(tr)
    view.focus() // Ensure the editor is focused
  } else {
    // Fallback: If targetLineNumber is out of bounds, focus at the end
    view.focus()
    const endPos = view.state.doc.content.size
    const tr = view.state.tr.setSelection(TextSelection.create(view.state.doc, endPos))
    view.dispatch(tr)
  }
}
