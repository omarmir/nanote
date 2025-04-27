<template>
  <div>
    <aside
      id="sidenav-main"
      ref="sidebar"
      :class="{ '-translate-x-full': !isSidebarOpen }"
      class="fixed inset-y-0 left-0 z-40 m-0 flex w-[350px] shrink-0 flex-col overflow-y-auto overflow-x-hidden bg-neutral-900 transition-all duration-300 ease-in-out lg:translate-x-0 [&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-neutral-300 [&::-webkit-scrollbar]:w-1">
      <div class="h-svw">
        <!--logo start-->
        <NuxtLink to="/">
          <div class="flex h-[96px] shrink-0 items-center justify-start gap-4 px-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-10" viewBox="0 0 50 50">
              <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path
                  stroke="#306cfe"
                  d="M39.583 6.25H10.417c-1.15 0-2.084.933-2.084 2.083v33.334c0 1.15.933 2.083 2.084 2.083h29.166c1.15 0 2.084-.933 2.084-2.083V8.333c0-1.15-.933-2.083-2.084-2.083" />
                <path
                  stroke="#344054"
                  d="M10.417 6.25h6.25v37.5h-6.25a2.083 2.083 0 0 1-2.084-2.083V8.333a2.083 2.083 0 0 1 2.084-2.083" />
              </g>
            </svg>
            <h1 class="text-xl font-bold text-white">nanote</h1>
          </div>
        </NuxtLink>
        <!--logo end-->
        <div class="relative">
          <div class="flex w-full flex-col font-medium">
            <div class="mb-4 flex flex-row items-center justify-between px-4">
              <SearchButton @click="showCommandPalette = true"></SearchButton>
              <DarkModeSwitcher></DarkModeSwitcher>
            </div>
            <!-- menu item -->
            <ul>
              <li class="flex cursor-pointer select-none items-center rounded-xl px-4 py-3">
                <NuxtLink
                  to="/"
                  class="flex flex-grow flex-row items-center gap-2 text-base font-medium text-gray-400 hover:text-white"
                  @click="outsideClick()">
                  <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M6 19h3v-6h6v6h3v-9l-6-4.5L6 10zm-2 2V9l8-6l8 6v12h-7v-6h-2v6zm8-8.75" />
                  </svg>
                  Home
                </NuxtLink>
              </li>
              <li class="flex cursor-pointer select-none items-center rounded-xl px-4 py-3">
                <button
                  class="flex flex-grow flex-row items-center gap-2 text-base font-medium text-gray-400 hover:text-white"
                  @click="logout()">
                  <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h7v2H5v14h7v2zm11-4l-1.375-1.45l2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5z" />
                  </svg>
                  Logout
                </button>
              </li>
            </ul>
            <!-- menu item -->
            <div>
              <span class="flex select-none items-center px-4 py-3 text-xs font-medium text-neutral-200">
                Notebooks
              </span>
              <NotebookSidebarNotebooks></NotebookSidebarNotebooks>
            </div>
          </div>
        </div>
      </div>
    </aside>
    <div
      v-if="isSidebarOpen"
      class="fixed left-0 top-0 z-30 flex h-[100%] w-[100%] animate-overlayShow flex-row items-center justify-center bg-gray-950/50 lg:hidden"></div>
  </div>
  <SearchCommandPalette v-model="showCommandPalette"></SearchCommandPalette>
</template>
<script lang="ts" setup>
import { onClickOutside, useMagicKeys, whenever } from '@vueuse/core'

const { isSidebarOpen, outsideClick } = useSidebar()
const input = useTemplateRef('sidebar')
const showCommandPalette = ref(false)

onClickOutside(input, () => (isSidebarOpen.value = false))

const logout = async () => {
  await $fetch('/api/auth/logout')
  outsideClick()
  localStorage.setItem('isLoggedIn', 'false')
  navigateTo('/login')
}

const { ctrl_k } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.ctrlKey && e.key === 'k' && e.type === 'keydown') e.preventDefault()
  }
})

whenever(ctrl_k, () => {
  showCommandPalette.value = true
})
</script>
