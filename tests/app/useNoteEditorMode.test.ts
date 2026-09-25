import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { useNoteEditorMode } from '../../app/composables/useNoteEditorMode'

describe('useNoteEditorMode', () => {
  it('uses the global preference initially and keeps a toggle local to the current note', async () => {
    const isMarkdown = ref<boolean | null>(true)
    const preferCodeView = ref(false)
    const notePath = ref('/note/first.md')
    const { isCodeView, toggleCodeView } = useNoteEditorMode(isMarkdown, preferCodeView, notePath)

    expect(isCodeView.value).toBe(false)
    toggleCodeView()
    expect(isCodeView.value).toBe(true)

    notePath.value = '/note/second.md'
    await nextTick()
    expect(isCodeView.value).toBe(false)

    preferCodeView.value = true
    expect(isCodeView.value).toBe(true)
    toggleCodeView()
    expect(isCodeView.value).toBe(false)

    notePath.value = '/note/third.md'
    await nextTick()
    expect(isCodeView.value).toBe(true)
  })

  it('keeps non-Markdown files in code view', () => {
    const isMarkdown = ref<boolean | null>(false)
    const { isCodeView, toggleCodeView } = useNoteEditorMode(
      isMarkdown,
      ref(false),
      ref('/note/plain.txt')
    )

    expect(isCodeView.value).toBe(true)
    toggleCodeView()
    expect(isCodeView.value).toBe(true)
  })
})
