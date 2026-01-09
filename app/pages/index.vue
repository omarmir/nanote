<template>
  <UDashboardPanel id="home">
    <template #header>
      <TopBar />
    </template>
    <template #body>
      <Suspense>
        <NotebooksAll />
        <template #fallback>
          <SkeletonsAllNotebooks />
        </template>
      </Suspense>
      <Suspense>
        <NotesRecent />
        <template #fallback>
          <SkeletonsRecentNotes />
        </template>
      </Suspense>
    </template>
  </UDashboardPanel>
</template>

<script lang="ts" setup></script>
