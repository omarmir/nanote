<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <div class="flex flex-row items-center gap-4">
            <ThemePicker class="size-5 cursor-pointer"></ThemePicker>
            <ULink to="https://github.com/omarmir/nanote" target="_blank">
              <UAvatar icon="i-custom-simple-icons-github" size="md" />
            </ULink>
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
