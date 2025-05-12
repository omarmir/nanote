<template>
  <div>
    <aside
      id="sidenav-main"
      ref="sidebar"
      :class="{ '-translate-x-full': !isSidebarOpen }"
      class="fixed inset-y-0 left-0 z-40 m-0 flex w-[300px] shrink-0 flex-col overflow-y-auto overflow-x-hidden bg-neutral-900 transition-all duration-300 ease-in-out lg:w-[350px] lg:translate-x-0 [&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-neutral-300 [&::-webkit-scrollbar]:w-1">
      <div class="h-svw">
        <!--logo start-->
        <div class="flex w-full flex-row place-content-end px-4 lg:place-content-start">
          <NuxtLink to="/" class="hidden lg:block">
            <div class="flex h-[96px] shrink-0 items-center justify-start gap-4">
              <Icon name="marketeq:notebook" class="size-10"></Icon>
              <h1 class="text-xl font-bold text-white">nanote</h1>
            </div>
          </NuxtLink>
          <button title="Close sidebar" class="inline py-4 hover:text-red-500 lg:hidden" @click="outsideClick()">
            <Icon name="lucide:x"></Icon>
          </button>
        </div>
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
                  <Icon name="lucide:house" />
                  Home
                </NuxtLink>
              </li>
              <li class="flex cursor-pointer select-none items-center rounded-xl px-4 py-3">
                <NuxtLink
                  to="/settings"
                  class="flex flex-grow flex-row items-center gap-2 text-base font-medium text-gray-400 hover:text-white"
                  @click="outsideClick()">
                  <Icon name="lucide:settings" />
                  Settings
                </NuxtLink>
              </li>
              <li class="flex cursor-pointer select-none items-center rounded-xl px-4 py-3">
                <button
                  class="flex flex-grow flex-row items-center gap-2 text-base font-medium text-gray-400 hover:text-white"
                  @click="logout()">
                  <Icon name="lucide:log-out" />
                  Logout
                </button>
              </li>
            </ul>
            <!-- menu item -->
            <div>
              <div class="flex select-none items-center justify-between px-4 py-3 text-xs font-medium text-neutral-200">
                <div class="flex min-h-5 flex-row items-center gap-2">
                  <span>Notebook</span>
                  <CommonCollapseNotebooksButton
                    v-if="notebookStore.sidebarOpenNotebooks.length > 0"
                    @click="notebookStore.resetSidebarNotebook()"></CommonCollapseNotebooksButton>
                </div>
                <DenseListSwitcher v-if="notebookStore.sidebarOpenNotebooks.length > 0"></DenseListSwitcher>
              </div>
              <CommonDangerAlert v-if="settingsStore.error || settingsStore.settingSetError" class="mb-4 rounded-none">
                <div v-if="settingsStore.error">{{ settingsStore.error }}</div>
                <div v-if="settingsStore.settingSetError">{{ settingsStore.settingSetError }}</div>
              </CommonDangerAlert>
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
const notebookStore = useNotebookStore()
const settingsStore = useSettingsStore()
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
