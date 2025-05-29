<template>
  <div>
    <SettingsBasicSettings></SettingsBasicSettings>
    <Suspense>
      <SettingsSharedNotes></SettingsSharedNotes>
    </Suspense>
    <Suspense>
      <SettingsWarnings></SettingsWarnings>
    </Suspense>
  </div>
</template>
<script lang="ts" setup></script>
