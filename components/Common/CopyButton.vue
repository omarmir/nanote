<template>
  <button
    v-if="isSupported"
    class="bg-transparent hover:text-accent dark:text-white dark:hover:text-accent"
    @click="copyLink()">
    <Icon v-if="isCopied === null" name="lucide:copy"></Icon>
    <Icon v-if="isCopied" name="lucide:circle-check" class="text-emerald-600"></Icon>
    <Icon v-if="isCopied === false" name="lucide:circle-x" class="text-red-500"></Icon>
  </button>
</template>
<script lang="ts" setup>
import { useClipboard } from '@vueuse/core'
const { link } = defineProps<{ link?: string }>()
const { copy, copied, isSupported } = useClipboard()

const model = defineModel<string>({ required: false })

if (link) model.value = link

const isCopied: Ref<boolean | null> = ref(null)

const copyLink = async () => {
  if (!model.value) return
  await copy(model.value)
  isCopied.value = copied.value
  setTimeout(() => {
    isCopied.value = null
  }, 5000)
}
</script>
