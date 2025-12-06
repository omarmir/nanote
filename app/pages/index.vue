<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <div class="flex flex-row items-center gap-2">
            <ThemePicker class="size-5 cursor-pointer"></ThemePicker>
            <UButton icon="i-custom-code-more" variant="ghost" class="cursor-pointer"></UButton>
            <UButton
              to="https://github.com/omarmir/nanote"
              icon="i-custom-simple-icons-github"
              target="_blank"
              variant="ghost"
              color="neutral" />
          </div>
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <Suspense>
        <NotebooksAll></NotebooksAll>
        <template #fallback>
          <SkeletonsAllNotebooks></SkeletonsAllNotebooks>
        </template>
      </Suspense>
      <Suspense>
        <NotesRecent></NotesRecent>
        <template #fallback>
          <SkeletonsRecentNotes></SkeletonsRecentNotes>
        </template>
      </Suspense>
    </template>
  </UDashboardPanel>
</template>
<script lang="ts" setup></script>
