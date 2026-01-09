<template>
  <UForm id="settings">
    <UPageCard
      :title="t('settings.navigation.general')"
      description="These informations will be displayed publicly."
      variant="naked"
      orientation="horizontal"
      class="mb-4" />

    <UPageCard variant="subtle">
      <USwitch
        v-model="store.settings.isDense"
        :label="t('settings.hideDateTime.value')"
        :description="t('settings.hideDateTime.help')"
        :ui="{ root: 'flex-row-reverse w-full justify-between' }" />

      <USeparator />
      <USwitch
        v-model="store.settings.isISODate"
        :label="t('settings.standardISOTime.value')"
        :description="t('settings.standardISOTime.help')"
        :ui="{ root: 'flex-row-reverse w-full justify-between' }" />

      <USeparator />
      <USwitch
        v-model="store.settings.isParagraphSpaced"
        :label="t('settings.spacePara.value')"
        :description="t('settings.spacePara.help')"
        :ui="{ root: 'flex-row-reverse w-full justify-between' }" />

      <USeparator />
      <USwitch
        v-model="store.settings.isCodeViewAllFiles"
        :label="t('settings.alwaysCodeView.value')"
        :description="t('settings.alwaysCodeView.help')"
        :ui="{ root: 'flex-row-reverse w-full justify-between' }" />
    </UPageCard>
  </UForm>
</template>

<script setup lang="ts">
const store = useSettingsStore()
const { t } = useI18n()
</script>
