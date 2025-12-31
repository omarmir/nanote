<template>
  <UModal>
    <slot name="trigger"></slot>
    <template #content>
      <UCommandPalette
        v-model:search-term="search"
        :loading="status === 'pending'"
        :groups
        placeholder="Search users..."
        class="h-80">
        <template #footer>
          <div class="flex items-center justify-between gap-2">
            <UIcon name="i-simple-icons-nuxtdotjs" class="text-dimmed ml-1 size-5" />
            <div class="flex items-center gap-1">
              <UButton color="neutral" variant="ghost" label="Open Command" class="text-dimmed" size="xs">
                <template #trailing>
                  <UKbd value="enter" />
                </template>
              </UButton>
              <USeparator orientation="vertical" class="h-4" />
              <UButton color="neutral" variant="ghost" label="Actions" class="text-dimmed" size="xs">
                <template #trailing>
                  <UKbd value="meta" />
                  <UKbd value="k" />
                </template>
              </UButton>
            </div>
          </div>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'

const router = useRouter()

const { search, clearSearch, results, noResults, status, error } = useSearch()

const groups: ComputedRef<CommandPaletteGroup<CommandPaletteItem>[]> = computed(() => [
  {
    id: 'search-results',
    label: search.value ? `Users matching “${search.value}”...` : 'Users',
    items:
      results.value?.map((item) => {
        return {
          id: item.notebook || 'unknown-id', // Fallback to a default id if item.notebook is undefined
          label: item.name || 'Unnamed Item', // Fallback to a default label if item.name is undefined
          ignoreFilter: true
        }
      }) ?? []
  }
])
</script>
