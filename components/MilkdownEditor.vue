<template>
  <Milkdown class="milkdown-editor" :class="{ focus: isFocus, disabled }" />
</template>

<script setup lang="ts">
import { Milkdown, useEditor } from '@milkdown/vue'
import { Crepe } from '@milkdown/crepe'
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener'
import { upload, uploadConfig } from '@milkdown/kit/plugin/upload'
import { imageInlineComponent, inlineImageConfig } from '@milkdown/kit/component/image-inline'
import { imageBlockConfig } from '@milkdown/kit/component/image-block'
import { editorViewOptionsCtx, editorViewCtx } from '@milkdown/kit/core'
import { emoji } from '@milkdown/plugin-emoji'
import { createUploader, onUpload, toCheckUploader } from '~/utils/uploader'
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/nord.css'
import '@milkdown/crepe/theme/nord-dark.css'
import { filePicker, filePickerNodeBlock, filePickerConfig, clearContentAndAddBlockType } from 'milkdown-plugin-file' //'@/utils/md-plugins/milkdown-plugin-file/src'
import { dateTimeTextSubs } from '~/milkdown/text-sub'
import { html } from 'atomico'

const model = defineModel<string>({ required: true })
const { disabled, isFocus, note, notebooks } = defineProps<{
  disabled: boolean
  isFocus: boolean
  note: string
  notebooks: string[]
}>()

const customUploader = createUploader()
const path = notePathArrayJoiner([...notebooks, note])

useEditor((root) => {
  const crepe = new Crepe({
    root,
    defaultValue: model.value,
    features: {
      [Crepe.Feature.Latex]: true
    },
    featureConfigs: {
      'block-edit': {
        buildMenu: (builder) => {
          const advanced = builder.getGroup('advanced')
          advanced.addItem('file', {
            label: 'Attachment',
            icon: html`
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.324 8.436L9.495 12.19c-.364.36-.564.852-.556 1.369a2 2 0 0 0 .6 1.387c.375.371.88.584 1.403.593a1.92 1.92 0 0 0 1.386-.55l3.828-3.754a3.75 3.75 0 0 0 1.112-2.738a4 4 0 0 0-1.198-2.775a4.1 4.1 0 0 0-2.808-1.185a3.85 3.85 0 0 0-2.77 1.098L6.661 9.39a5.63 5.63 0 0 0-1.667 4.107a6 6 0 0 0 1.798 4.161a6.15 6.15 0 0 0 4.21 1.778a5.77 5.77 0 0 0 4.157-1.646l3.829-3.756" />
              </svg>
            `,
            onRun: (ctx) => {
              const view = ctx.get(editorViewCtx)
              const { dispatch, state } = view
              const command = clearContentAndAddBlockType(filePickerNodeBlock.type(ctx))
              command(state, dispatch)
            }
          })
        }
      }
    }
  })

  crepe.editor
    .config((ctx) => {
      const listener = ctx.get(listenerCtx)
      listener.markdownUpdated((_ctx, markdown, prevMarkdown) => {
        if (markdown !== prevMarkdown) {
          model.value = markdown
        }
      })

      listener.mounted((ctx) => {
        if (model.value.length === 0) ctx.get(editorViewCtx).focus()
      })

      ctx.update(imageBlockConfig.key, (defaultConfig) => ({
        ...defaultConfig,
        onUpload: async (file: File) => onUpload(file, path)
      }))

      ctx.update(inlineImageConfig.key, (prev) => ({
        ...prev,
        onUpload: async (file: File) => onUpload(file, path)
      }))

      ctx.update(uploadConfig.key, (prev) => ({
        ...prev,
        uploader: customUploader
      }))

      ctx.update(filePickerConfig.key, (prev) => ({
        ...prev,
        onUpload: async (file: File) => onUpload(file, path),
        toCheckUpload: async (url: string) => toCheckUploader(url),
        failedCheckMessage: 'Unable to access file!'
      }))

      ctx.update(editorViewOptionsCtx, (prev) => ({
        ...prev,
        editable: () => !disabled
      }))
    })
    .use(listener)
    .use(upload)
    .use(emoji)
    .use(imageInlineComponent)
    .use(filePicker)
    .use(dateTimeTextSubs)
  return crepe
})
</script>
<style lang="postcss">
.milkdown-editor.focus div.milkdown milkdown-block-handle,
.milkdown-editor.disabled div.milkdown milkdown-block-handle {
  display: none;
}

.milkdown-editor div.milkdown milkdown-block-handle {
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
</style>
