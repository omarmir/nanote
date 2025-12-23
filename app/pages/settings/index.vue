<template>
  <UForm id="settings">
    <UPageCard
      title="Profile"
      description="These informations will be displayed publicly."
      variant="naked"
      orientation="horizontal"
      class="mb-4"></UPageCard>

    <UPageCard variant="subtle">
      <USwitch
        :label="t('settings.hideDateTime.value')"
        :description="t('settings.hideDateTime.help')"
        :ui="{ root: 'flex-row-reverse w-full justify-between' }" />

      <USeparator />
      <USwitch label="Check me" description="This is a checkbox." />

      <USeparator />
      <USwitch label="Check me" description="This is a checkbox." />

      <USeparator />
      <USwitch label="Check me" description="This is a checkbox." />
    </UPageCard>
  </UForm>
</template>
<script setup lang="ts">
const store = useSettingsStore()
const { t } = useI18n()
</script>
