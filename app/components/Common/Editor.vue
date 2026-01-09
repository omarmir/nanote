<template>
  <div class="mb-5 flex flex-wrap" :class="{ 'sm:mx-[60px]': isMD }">
    <div class="mb-6 w-full max-w-full px-3 sm:flex-none">
      <MilkdownProvider v-if="isMD && settingsStore.settings.isCodeViewAllFiles !== true">
        <MilkdownEditor v-model="content" :ln :api-path :disabled />
      </MilkdownProvider>
      <NuxtCodeMirror
        v-else-if="!isMD || settingsStore.settings.isCodeViewAllFiles"
        :key="`${disabled.toString()}`"
        ref="codemirror"
        v-model="content"
        class="file-editor mt-4 w-full"
        :placeholder="t('contentHere')"
        :auto-focus="true"
        :editable="!disabled"
        :line-wrapping="true"
        :basic-setup="true"
        :extensions="[EditorView.lineWrapping]"
        :indent-with-tab="true"
        @on-create-editor="({ view, state }: { view: EditorView; state: EditorState }) => cmCreated(view, state)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { MilkdownProvider } from '@milkdown/vue'
import { EditorView } from '@codemirror/view'
import { useRouter } from 'vue-router'
import type { EditorState } from '@codemirror/state'

const { isMD, apiPath, disabled } = defineProps<{
  isMD: boolean
  apiPath: string
  disabled: boolean
}>()

const router = useRouter()
const settingsStore = useSettingsStore()
const { t } = useI18n()

const content = defineModel<string>('content', { required: true })

const queryParams = router.currentRoute.value.query

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
</script>

<style>
@import 'tailwindcss';
@import '@nuxt/ui';

.cm-editor {
  @apply bg-transparent!;
}

.cm-activeLine {
  @apply bg-primary/15! dark:bg-primary/10!;
}

.cm-gutters {
  @apply border-none! bg-gray-100! dark:bg-neutral-800!;
}

.cm-activeLineGutter {
  @apply bg-primary/25! dark:bg-primary/35!;
}

.cm-gutterElement {
  @apply dark:text-gray-300;
}

.cm-line {
  @apply text-base;
}

.cm-selectionBackground {
  @apply bg-primary-400/40!;
}

.dark .cm-line::selection {
  @apply text-black;
}
</style>
