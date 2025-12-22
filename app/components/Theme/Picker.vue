<template>
  <UPopover :ui="{ content: 'w-72 px-6 py-4 flex flex-col gap-4' }">
    <template #default="{ open }">
      <UButton
        size="md"
        icon="i-lucide-swatch-book"
        color="neutral"
        :aria-label="t('theme')"
        :title="t('theme')"
        :variant="open ? 'soft' : 'ghost'"
        square
        :ui="{ leadingIcon: 'text-primary' }" />
    </template>

    <template #content>
      <fieldset>
        <legend class="mb-2 text-[11px] leading-none font-semibold">Primary</legend>

        <div class="-mx-2 grid grid-cols-3 gap-1">
          <ThemeButton
            :aria-label="t(`colours.${colour}`)"
            :title="t(`colours.${colour}`)"
            v-for="colour in colours"
            :key="colour"
            :label="t(`colours.${colour}`)"
            :chip="colour"
            :selected="primary === colour"
            @click="primary = colour" />
        </div>
      </fieldset>

      <fieldset>
        <legend class="mb-2 text-[11px] leading-none font-semibold">Neutral</legend>

        <div class="-mx-2 grid grid-cols-3 gap-1">
          <ThemeButton
            v-for="colour in neutrals"
            :key="colour"
            :label="t(`colours.${colour}`)"
            :chip="colour === 'neutral' ? 'old-neutral' : colour"
            :selected="neutral === colour"
            @click="neutral = colour" />
        </div>
      </fieldset>

      <fieldset>
        <legend class="mb-2 text-[11px] leading-none font-semibold">Theme</legend>

        <div class="-mx-2 grid grid-cols-3 gap-1">
          <ThemeButton
            v-for="m in modes"
            :key="m.label"
            v-bind="m"
            :selected="colorMode.preference === m.type"
            @click="mode = m.type" />
        </div>
      </fieldset>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()
const colorMode = useColorMode()
const { t } = useI18n()

const colours = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'sage',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose'
]
const neutrals = ['slate', 'gray', 'zinc', 'neutral', 'stone']

const neutral = computed({
  get() {
    return appConfig.ui.colors.neutral
  },
  set(option) {
    appConfig.ui.colors.neutral = option
    window.localStorage.setItem('nuxt-ui-neutral', appConfig.ui.colors.neutral)
  }
})

const primary = computed({
  get() {
    return appConfig.ui.colors.primary
  },
  set(option) {
    appConfig.ui.colors.primary = option
    window.localStorage.setItem('nuxt-ui-primary', appConfig.ui.colors.primary)
  }
})

const modes = [
  { label: t('modes.light'), icon: appConfig.ui.icons.light, type: 'light' },
  { label: t('modes.dark'), icon: appConfig.ui.icons.dark, type: 'dark' },
  { label: t('modes.system'), icon: appConfig.ui.icons.system, type: 'system' }
]
const mode = computed({
  get() {
    return colorMode.value
  },
  set(option) {
    colorMode.preference = option
  }
})
</script>
