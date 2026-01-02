<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible>
      <template #header="{ collapsed }">
        <NuxtLink class="flex flex-row items-center gap-4" to="/" :title="t('navigation.home')">
          <CommonLogo class="mx-auto size-8" :class="{ 'size-6': collapsed }" />
          <h1 class="text-xl font-bold text-gray-900 dark:text-white" :class="{ invisible: collapsed }">
            {{ t('appName') }}
          </h1>
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <SearchCommands />
        <UDashboardSearchButton
          :label="collapsed ? undefined : t('search')"
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
        </UDashboardSearchButton>
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
const route = useRoute()
const router = useRouter()

const { loggedIn, clear } = useUserSession()

const items = computed<NavigationMenuItem[]>(() => [
  [
    {
      label: t('navigation.home'),
      icon: 'i-lucide-house',
      active: route.path === '/',
      to: '/'
    },
    {
      label: t('navigation.settings'),
      icon: 'i-lucide-settings',
      to: '/settings',
      children: [
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
      ]
    },
    {
      label: t('navigation.guide'),
      icon: 'i-lucide-circle-question-mark',
      to: '/guide'
    },
    {
      label: loggedIn.value ? t('navigation.logout') : t('loginTitle'),
      icon: loggedIn.value ? 'i-lucide-log-out' : 'i-lucide-key-round',
      class: 'cursor-pointer',
      onSelect: async (e: Event) => {
        e.preventDefault()
        await clear()
        router.push('/login')
      }
    }
  ]
])
</script>
