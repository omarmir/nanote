<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible>
      <template #header="{ collapsed }">
        <div class="flex flex-row items-center gap-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="mx-auto size-8"
            :class="{ 'size-6': collapsed }"
            viewBox="0 0 50 50">
            <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path
                class="stroke-primary"
                d="M39.583 6.25H10.417c-1.15 0-2.084.933-2.084 2.083v33.334c0 1.15.933 2.083 2.084 2.083h29.166c1.15 0 2.084-.933 2.084-2.083V8.333c0-1.15-.933-2.083-2.084-2.083" />
              <path
                stroke="#344054"
                d="M10.417 6.25h6.25v37.5h-6.25a2.083 2.083 0 0 1-2.084-2.083V8.333a2.083 2.083 0 0 1 2.084-2.083" />
            </g>
          </svg>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white" :class="{ invisible: collapsed }">
            {{ t('appName') }}
          </h1>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UButton
          :label="collapsed ? undefined : t('search')"
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

        <UNavigationMenu :collapsed :items="items" orientation="vertical" color="primary" />
        <NotebooksSidebar :collapsed />
      </template>
    </UDashboardSidebar>
    <slot />
  </UDashboardGroup>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { t } = useI18n()

const items: Ref<NavigationMenuItem[]> = ref([
  [
    {
      label: t('navigation.home'),
      icon: 'i-lucide-house',
      active: true
    },
    {
      label: t('navigation.settings'),
      icon: 'i-lucide-settings-2'
    },
    {
      label: t('navigation.guide'),
      icon: 'i-lucide-circle-question-mark'
    },
    {
      label: t('navigation.logout'),
      icon: 'i-lucide-log-out'
    }
  ]
])
</script>
