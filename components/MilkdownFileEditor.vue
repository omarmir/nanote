<!-- MilkdownEditor.vue -->
<template>
  <Milkdown />
</template>

<script setup lang="ts">
import { Milkdown, useEditor } from '@milkdown/vue'
import { defaultKeymap } from '@codemirror/commands'
import { languages } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'
import { codeBlockComponent, codeBlockConfig } from '@milkdown/kit/component/code-block'
import { basicSetup } from 'codemirror'
import { defaultValueCtx, Editor } from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { nord } from '@milkdown/theme-nord'
import { keymap } from '@codemirror/view'
import '@milkdown/crepe/theme/nord.css'
import '@milkdown/crepe/theme/nord-dark.css'

const model = defineModel<string>({ required: true })

const check = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
`

useEditor((root) => {
  return Editor.make().config(nord).use(commonmark)
  // return Editor.make()
  //   .config((ctx) => {
  //     ctx.update(codeBlockConfig.key, (defaultConfig) => ({
  //       ...defaultConfig,
  //       languages,
  //       extensions: [basicSetup, oneDark, keymap.of(defaultKeymap)],
  //       renderLanguage: (language, selected) => {
  //         return `
  //           <span class="leading">${selected ? check : null}</span>
  //           ${language}
  //         `
  //       }
  //     }))
  //   })
  //   .use(codeBlockComponent)
})
</script>
<style lang="postcss">
.milkdown-editor .milkdown {
  --crepe-color-background: #fdfcff;
  --crepe-color-on-background: #1b1c1d;
  --crepe-color-surface: #f8f9ff;
  --crepe-color-surface-low: #f2f3fa;
  --crepe-color-on-surface: #191c20;
  --crepe-color-on-surface-variant: #43474e;
  --crepe-color-outline: #73777f;
  --crepe-color-primary: #37618e;
  --crepe-color-secondary: #d7e3f8;
  --crepe-color-on-secondary: #101c2b;
  --crepe-color-inverse: #2e3135;
  --crepe-color-on-inverse: #eff0f7;
  --crepe-color-inline-code: #ba1a1a;
  --crepe-color-error: #ba1a1a;
  --crepe-color-hover: #eceef4;
  --crepe-color-selected: #e1e2e8;
  --crepe-color-inline-area: #d8dae0;
  --crepe-shadow-1: 0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3);
}
.dark .milkdown-editor {
  .milkdown-slash-menu {
    span.milkdown-icon svg path {
      fill: white;
    }
  }
}

.dark .milkdown-editor .milkdown {
  --crepe-color-background: transparent;
  --crepe-color-on-background: #f8f9ff;
  --crepe-color-surface: #111418;
  --crepe-color-surface-low: #191c20;
  --crepe-color-on-surface: #e1e2e8;
  --crepe-color-on-surface-variant: #c3c6cf;
  --crepe-color-outline: #8d9199;
  --crepe-color-primary: #a1c9fd;
  --crepe-color-secondary: #3c4858;
  --crepe-color-on-secondary: #d7e3f8;
  --crepe-color-inverse: #e1e2e8;
  --crepe-color-on-inverse: #2e3135;
  --crepe-color-inline-code: #ffb4ab;
  --crepe-color-error: #ffb4ab;
  --crepe-color-hover: #1d2024;
  --crepe-color-selected: #32353a;
  --crepe-color-inline-area: #111418;
  --crepe-shadow-1: 0px 1px 2px 0px rgba(255, 255, 255, 0.3), 0px 1px 3px 1px rgba(255, 255, 255, 0.15);
  --crepe-shadow-2: 0px 1px 2px 0px rgba(255, 255, 255, 0.3), 0px 2px 6px 2px rgba(255, 255, 255, 0.15);
}

.milkdown-editor:is(.focus, .disabled) div.milkdown {
  .milkdown-block-handle {
    display: none;
  }
}

.milkdown-editor div.milkdown .milkdown-block-handle {
  @apply hidden lg:flex;
}

.milkdown-toolbar,
.milkdown-link-preview {
  z-index: 999 !important;
}

.milkdown-editor {
  .milkdown {
    @apply px-0 py-1;
    --crepe-color-background: transparent;
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin: 10px 0px;
    }

    .ProseMirror {
      p {
        @apply p-0 align-middle;
      }
    }

    > div {
      @apply px-0 py-0 text-gray-900 dark:text-gray-200;
    }

    .image-inline {
      @apply inline-block;
    }

    img.emoji {
      @apply mr-0.5 inline h-5;
    }

    milkdown-file-picker {
      @apply inline align-middle;

      a.attachment-button {
        @apply inline-flex flex-row items-center gap-2 rounded-md bg-slate-600 px-2 py-0.5 text-sm text-white no-underline hover:bg-accent-hover;
        div.file-icon {
          @apply inline-flex size-5;
        }
      }
      a.attachment-button.not-exist {
        @apply bg-red-500 text-white dark:bg-red-800;
        div.file-icon svg path {
          @apply !fill-red-200;
        }
      }
      .file-input {
        @apply inline cursor-pointer items-center rounded-md border border-gray-300 bg-gray-50 text-sm text-gray-900 file:cursor-pointer file:rounded-l-md file:border-none file:bg-accent file:py-0.5 file:text-white file:hover:bg-accent-hover focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400;
      }
      .uploading-icon {
        @apply inline size-5;
      }
      div.empty-file {
        @apply inline-flex flex-row items-center gap-1;
      }
    }
    milkdown-file-picker[data-inline='false'] {
      @apply block;
      .file-input {
        @apply my-2 file:py-1.5;
      }
      a.attachment-button {
        @apply flex flex-col gap-1 bg-transparent font-bold text-gray-900 hover:underline dark:text-white;
        div.file-icon {
          @apply size-10;
        }
      }
      a.attachment-button.not-exist {
        @apply bg-transparent;
        div.file-icon svg path {
          @apply !fill-red-500 dark:!fill-red-800;
        }
      }
    }
  }
}

.milkdown-editor.para-spaced {
  div.milkdown {
    .ProseMirror {
      p {
        @apply py-1;
      }
    }
  }
}

.milkdown-editor.disabled div.milkdown {
  p.crepe-placeholder {
    opacity: 0;
  }
}
</style>
