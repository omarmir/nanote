<template>
  <div class="mb-5 flex flex-wrap sm:mx-[60px]">
    <div class="mb-6 w-full max-w-full px-3 sm:flex-none">
      <!-- <UAlert v-if="error" class="mb-4">
        <template #title>
          {{ t('failure') }}
        </template>
        <template #description>
          {{ error }}
        </template>
      </UAlert> -->
      <MilkdownProvider v-if="isMD && settingsStore.settings.isCodeViewAllFiles !== true">
        <MilkdownEditor v-model="content" :note :ln :api-path :disabled />
      </MilkdownProvider>
      <!-- <NuxtCodeMirror
        v-else-if="(!isMD || settingsStore.settings.isCodeViewAllFiles) && !error"
        :key="`${isDark.toString()}-${isReadOnly.toString()}`"
        ref="codemirror"
        v-model="md"
        :theme="isDark ? 'dark' : 'light'"
        class="file-editor mt-4 w-full"
        :placeholder="t('contentHere')"
        :auto-focus="true"
        :editable="isReadOnly === false"
        :line-wrapping="true"
        :basic-setup="true"
        :extensions="[EditorView.lineWrapping]"
        :indent-with-tab="true"
        @on-create-editor="({ view, state }: { view: EditorView; state: EditorState }) => cmCreated(view, state)" /> -->
    </div>
  </div>
</template>
<script setup lang="ts">
import { MilkdownProvider } from '@milkdown/vue'
// import { EditorView } from '@codemirror/view'
import { useRouter } from 'vue-router'
// import type { EditorState } from '@codemirror/state'

const router = useRouter()
const settingsStore = useSettingsStore()

const { isMD, apiPath, disabled, note } = defineProps<{
  isMD: boolean
  apiPath: string
  disabled: boolean
  note: string
}>()

const content = defineModel<string>('content', { required: true })

const queryParams = router.currentRoute.value.query
// const colorMode = useColorMode()

const ln: number | undefined = queryParams.ln && Number.isInteger(+queryParams.ln) ? +queryParams.ln : undefined

// const cmCreated = (view: EditorView, state: EditorState) => {
//   if (ln && Number.isInteger(+ln)) {
//     const line = state.doc.line(+ln)

//     view.dispatch({
//       selection: { head: line.from, anchor: line.to }
//     })
//     setTimeout(() => {
//       const { top } = view.lineBlockAt(line.from)
//       window.scrollTo({
//         top,
//         left: 0,
//         behavior: 'smooth'
//       })
//     }, 2)
//   }
// }
</script>
<style lang="postcss">
.file-editor .cm-editor {
  @apply bg-transparent !important;
}

.file-editor .cm-focused {
  @apply outline-none;
}

.file-editor .cm-activeLine {
  @apply bg-accent/10! dark:bg-accent/20!;
}

.file-editor .cm-line {
  @apply text-base;
}
</style>
