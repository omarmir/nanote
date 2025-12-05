<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <ThemePicker></ThemePicker>
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
