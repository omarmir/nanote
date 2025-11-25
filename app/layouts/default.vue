<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible>
      <template #header="{ collapsed }">
        <div class="flex flex-row items-center gap-4">
          <UIcon name="i-marketeq-notebook" class="text-primary mx-auto size-8" :class="{ 'size-6': collapsed }" />
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

        <UNavigationMenu :collapsed="collapsed" :items="items" orientation="vertical" />
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
      icon: 'i-lucide-settings'
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
