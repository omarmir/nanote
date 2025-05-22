<template>
  <div>file</div>
</template>
<script lang="ts" setup>
import { defaultKeymap } from '@codemirror/commands'
import { languages } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'
import { keymap } from '@codemirror/view'
import { codeBlockComponent, codeBlockConfig } from '@milkdown/kit/component/code-block'
import { defaultValueCtx, Editor } from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { basicSetup } from 'codemirror'

await Editor.make()
  .config((ctx) => {
    ctx.update(codeBlockConfig.key, (defaultConfig) => ({
      ...defaultConfig,
      languages,
      extensions: [basicSetup, oneDark, keymap.of(defaultKeymap)],
      renderLanguage: (language, selected) => {
        return `<span class="leading">${selected ? check : null}</span
          >${language}`
      }
    }))
  })
  .use(commonmark)
  .use(codeBlockComponent)
  .create()
</script>
