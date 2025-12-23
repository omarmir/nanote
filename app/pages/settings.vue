<template>
  <UDashboardPanel id="settings">
    <template #header>
      <TopBar :name="t('navigation.settings')" />
      <UDashboardToolbar>
        <!-- NOTE: The `-mx-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>

    <template #body>
      <NuxtPage />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { t } = useI18n()

const links = [
  [
    {
      label: t('settings.navigation.general'),
      icon: 'i-lucide-settings-2',
      to: '/settings',
      exact: true
    },
    {
      label: t('settings.navigation.shared'),
      icon: 'i-lucide-share-2',
      to: '/settings/shared'
    },
    {
      label: t('settings.navigation.health'),
      icon: 'i-lucide-activity',
      to: '/settings/health'
    }
  ],
  [
    {
      label: t('navigation.guide'),
      icon: 'i-lucide-circle-question-mark',
      to: '/guide'
    }
  ]
] satisfies NavigationMenuItem[][]
</script>
