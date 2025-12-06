<template>
  <UDashboardPanel id="home">
    <template #header>
      <TopBar />
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
