<template>
  <div class="flex h-screen items-center justify-center">
    <div class="absolute top-4 right-4">
      <LanguageSwitcher />
    </div>
    <UPageCard variant="subtle" class="w-full max-w-sm">
      <slot />
    </UPageCard>
  </div>
</template>
