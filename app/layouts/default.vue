<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible>
      <template #header>
        <div class="flex flex-row items-center gap-4">
          <UIcon name="i-marketeq-notebook" class="text-primary mx-auto size-10" />
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">nanote</h1>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UButton
          :label="collapsed ? undefined : 'Search...'"
          icon="i-lucide-search"
          color="neutral"
          variant="outline"
          block
          :square="collapsed">
          <template v-if="!collapsed" #trailing>
            <div class="ms-auto flex items-center gap-0.5">
              <UKbd value="meta" variant="subtle" />
              <UKbd value="K" variant="subtle" />
            </div>
          </template>
        </UButton>

        <UNavigationMenu :collapsed="collapsed" :items="items" orientation="vertical" />
      </template>
    </UDashboardSidebar>
    <slot />
  </UDashboardGroup>
</template>
<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items: Ref<NavigationMenuItem[]> = ref([
  [
    {
      label: 'Home',
      icon: 'i-lucide-house',
      active: true
    },
    {
      label: 'Settings',
      icon: 'i-lucide-settings'
    },
    {
      label: 'Guide',
      icon: 'i-lucide-circle-question-mark'
    },
    {
      label: 'Logout',
      icon: 'i-lucide-log-out'
    }
  ]
])
</script>
