<template>
  <div
    v-if="open"
    class="fixed left-0 top-0 z-50 flex h-[100%] w-[100%] animate-overlayShow flex-row items-center justify-center bg-gray-950/50 dark:bg-slate-700/50"></div>
  <div
    v-if="open"
    class="fixed left-0 top-0 z-50 flex h-[100%] w-[100%] flex-row justify-center"
    :class="{ 'items-center': position === 'middle', 'top-1 lg:top-24': position === 'top' }"
    @keydown="keyDown">
    <dialog
      ref="dialog-wrapper"
      aria-describedby="desc"
      aria-labelledby="title"
      :aria-hidden="!open"
      :open="open"
      :title
      class="z-[100] max-h-[85vh] w-[100%] animate-popIn rounded-md bg-white shadow-md focus:outline-none dark:bg-neutral-800 md:max-w-[70%] lg:max-w-[50%] xl:max-w-[40%]">
      <div class="flex flex-col gap-4" :class="isCommand ? 'p-2' : 'p-[25px]'">
        <div v-if="!hideTitleDesc" class="flex flex-col gap-4">
          <h2 id="title" class="text-md font-medium text-accent" :class="{ 'text-red-600': theme === 'danger' }">
            {{ title }}
          </h2>
          <p id="desc" class="text-sm font-normal text-gray-900 dark:text-gray-400">
            <slot name="desc">
              {{ desc }}
            </slot>
          </p>
        </div>
        <slot></slot>
      </div>
      <div v-if="isCommand" class="h-8 w-full bg-gray-200 shadow-top-md">
        <div
          class="mt-4 rounded-b-md border-t bg-gray-100 p-4 text-sm shadow-[0_-1px_#e0e3e8,0_-3px_6px_#45629b1f] dark:border-gray-700 dark:bg-gray-900 dark:shadow-none">
          <ul class="flex list-none gap-2">
            <li class="flex items-center">
              <kbd class="mr-1 flex h-5 items-center justify-center rounded-md bg-gray-300 px-1 font-bold">enter</kbd>
              <span class="text-gray-900 dark:text-white">to select</span>
            </li>
            <li class="flex items-center">
              <kbd class="mx-1 flex h-5 items-center justify-center rounded-md bg-gray-300 px-1 font-bold">tab</kbd>
              <span class="text-gray-900 dark:text-white">navigate</span>
            </li>
            <li class="flex items-center">
              <kbd class="mr-1 flex h-5 items-center justify-center rounded-md bg-gray-300 px-1 font-bold">esc</kbd>
              <span class="text-gray-900 dark:text-white">close</span>
            </li>
          </ul>
        </div>
      </div>
    </dialog>
  </div>
</template>
<script lang="ts" setup>
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import type { Theme } from '~/types/ui'
const open = defineModel<boolean>({ required: true })

const {
  title,
  desc,
  theme = 'primary',
  hideTitleDesc = false,
  position = 'middle',
  isCommand = false
} = defineProps<{
  title: string
  desc: string
  theme?: Theme
  hideTitleDesc?: boolean
  position?: 'top' | 'middle'
  isCommand?: boolean
}>()

const dialogWrapper = useTemplateRef('dialog-wrapper')

onClickOutside(dialogWrapper, () => {
  open.value = false
})

const keyDown = (payload: KeyboardEvent) => {
  switch (payload.key) {
    case 'Esc': {
      open.value = false
      break
    }
  }
}

onKeyStroke('Escape', (e) => {
  e.preventDefault()
  open.value = false
})
</script>
