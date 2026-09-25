import type { Ref } from 'vue'

export const useNoteEditorMode = (
  isMarkdown: Ref<boolean | null>,
  preferCodeView: Ref<boolean>,
  notePath: Ref<string>
) => {
  const codeViewOverride = ref<boolean | null>(null)
  const isCodeView = computed(() =>
    isMarkdown.value === true ? (codeViewOverride.value ?? preferCodeView.value) : true
  )

  const toggleCodeView = () => {
    if (isMarkdown.value === true) codeViewOverride.value = !isCodeView.value
  }

  watch(notePath, () => {
    codeViewOverride.value = null
  })

  return { isCodeView, toggleCodeView }
}
