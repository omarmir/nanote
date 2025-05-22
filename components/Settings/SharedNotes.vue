<template>
  <div>
    <CommonBaseCard class="px-4 pb-2 pt-5 lg:px-9">
      <h3 class="text-dark m-2 ml-0 flex flex-col items-start justify-center">
        <span class="mr-3 text-lg font-medium dark:text-gray-300">Shared Notes</span>
        <span class="font-base mt-1 text-sm text-gray-600 dark:text-gray-400">Manage shared notes</span>
      </h3>
      <div class="my-2">
        <table v-if="status === 'success' || status === 'pending'" class="w-full">
          <thead>
            <tr>
              <th class="text-left">Note</th>
              <th class="text-left">Name</th>
              <th class="text-left">Link</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="status === 'pending'">
              <td><CommonLoadingIndicator /></td>
              <td><CommonLoadingIndicator /></td>
              <td><CommonLoadingIndicator /></td>
              <td></td>
            </tr>
            <tr
              v-for="share in data"
              v-else
              :key="share.id"
              class="border-b border-dashed border-neutral-200 last:border-b-0 dark:border-neutral-700">
              <td class="py-3">{{ share.path }}</td>
              <td>{{ share.name }}</td>
              <td><a :href="`${origin}/share/${share.key}`" target="_blank">Click Here</a></td>
              <td>
                <div class="flex gap-4">
                  <CommonCopyButton :link="`${origin}/share/${share.key}`"></CommonCopyButton>
                  <SettingsDeleteSharedNote :shared-note="share" @deleted="deletedShared"></SettingsDeleteSharedNote>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <CommonDangerAlert v-if="status === 'error' && error" class="mb-4 rounded-none">
          {{ error }}
        </CommonDangerAlert>
      </div>
    </CommonBaseCard>
  </div>
</template>
<script setup lang="ts">
import type { SelectShared } from '~/server/db/schema'

const { data, status, error } = await useFetch<SelectShared[]>('/api/settings/shared', { method: 'GET', lazy: true })
const origin = window.location.origin

const deletedShared = (key: string) => {
  data.value = data.value?.filter((sharedNote) => sharedNote.key !== key) ?? []
}
</script>
