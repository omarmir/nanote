<template>
  <ul role="list" class="divide-default divide-y">
    <li class="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <div class="flex min-w-0 items-center gap-3">
        <div class="min-w-0 text-sm">
          <p class="text-highlighted truncate font-medium">
            <USkeleton class="h-2 w-42"></USkeleton>
          </p>
          <p class="text-muted truncate">
            <USkeleton class="mt-2 h-2 w-2xl"></USkeleton>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <USkeleton class="size-5"></USkeleton>
      </div>
    </li>
  </ul>
</template>
