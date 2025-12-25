<template>
  <ul role="list" class="divide-default divide-y">
    <li v-if="error">
      <UAlert
        :title="t('failure')"
        :description="error?.data.message ?? error?.message"
        color="error"
        class="rounded-t-none"></UAlert>
    </li>
    <li v-for="note in notes" :key="note.id" class="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <div class="flex min-w-0 items-center gap-3">
        <div class="min-w-0 text-sm">
          <p class="text-highlighted truncate font-medium">
            <span v-if="note.name">{{ note.name }}</span>
            <span v-else>{{ note.key }}</span>
          </p>
          <p class="text-muted truncate">
            {{ note.path }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <CommonStatusedButton
          icon="i-lucide-copy"
          v-if="isSupported"
          size="sm"
          :label="t('copy')"
          :async-fn="() => copyLink(note.key)"
          color="primary"
          variant="soft"></CommonStatusedButton>
        <CommonStatusedButton
          v-if="isSupported"
          size="sm"
          icon="i-lucide-trash-2"
          :label="t('delete')"
          :async-fn="() => deletedShared(note.key, note.name)"
          color="error"
          variant="soft"></CommonStatusedButton>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { SelectShared } from '~~/server/db/schema'
import { useClipboard } from '@vueuse/core'
import { FetchError } from 'ofetch'

const { searchString } = defineProps<{ searchString: string }>()

const { copy, isSupported } = useClipboard()
const { t } = useI18n()
const toast = useToast()

const { data, error } = await useFetch<SelectShared[]>('/api/share', {
  method: 'GET',
  immediate: true
})

const notes = ref([...(data.value ?? [])])

watch(
  () => searchString,
  () => {
    notes.value =
      data.value?.filter((item) => item.name?.includes(searchString) || item.path.includes(searchString)) ?? []
  }
)

const deletedShared = async (key: string, name: string | null): Promise<Result<boolean>> => {
  try {
    const deletingResp = await $fetch<boolean>(`/api/share/${key}`, { method: 'DELETE' })
    if (deletingResp) {
      toast.add({ title: t('success'), description: t('deleted', { item: name ?? key }), color: 'success' })
      notes.value = notes.value?.filter((sharedNote) => sharedNote.key !== key) ?? []
      return { success: true, data: true }
    } else {
      toast.add({ title: t('failure'), description: t('errors.failedDeleteShareLink'), color: 'error' })
      return { success: false, message: t('errors.failedDeleteShareLink') }
    }
  } catch (err) {
    const errorMsg = (err as FetchError).data.message
    toast.add({ title: t('failure'), description: errorMsg, color: 'error' })
    return { success: false, message: errorMsg }
  }
}

const copyLink = async (shareKey: string): Promise<Result<boolean>> => {
  const shareLink = `${window.location.origin}/share/${shareKey}`
  try {
    await copy(shareLink)
    return { success: true, data: true }
  } catch (err) {
    console.error(err)
    return { success: false, message: err instanceof Error ? err.message : String(err) }
  }
}
</script>
