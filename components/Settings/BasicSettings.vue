<template>
  <div>
    <CommonBaseCard class="px-4 pb-2 pt-5 lg:px-9">
      <h3 class="text-dark m-2 ml-0 flex flex-col items-start justify-center">
        <span class="mr-3 text-lg font-medium dark:text-gray-300">Settings</span>
        <span class="font-base mt-1 text-sm text-gray-600 dark:text-gray-400">Customize your nanote experience</span>
      </h3>
      <div class="my-2">
        <div class="grid grid-cols-2 gap-4">
          <!--Setting-->
          <div class="flex flex-row items-center gap-2">
            Hide note date and time
            <CommonTooltip>Don't show date and time in the user interface when listing notes</CommonTooltip>
          </div>
          <div class="flex place-content-end">
            <CommonToggleBox v-model="store.settings.isDense">
              <span class="hidden">Hide note date and time</span>
            </CommonToggleBox>
          </div>
          <!--Setting-->
          <div class="flex flex-row items-center gap-2">
            Use ISO standard date and time
            <CommonTooltip>Dates as YYYY-MM-DD and time using 24 hour clock as Thh:mm:ss</CommonTooltip>
          </div>
          <div class="flex place-content-end">
            <CommonToggleBox v-model="store.settings.isISODate">
              <span class="hidden">Hide note date and time</span>
            </CommonToggleBox>
          </div>
          <!--Setting-->
          <div class="flex flex-row items-center gap-2">
            Space paragraphs
            <CommonTooltip>Automatically put some spacing between paragraphs</CommonTooltip>
          </div>
          <div class="flex place-content-end">
            <CommonToggleBox v-model="store.settings.isParagraphSpaced">
              <span class="hidden">Space paragraphs</span>
            </CommonToggleBox>
          </div>
        </div>
      </div>
    </CommonBaseCard>
  </div>
</template>
<script lang="ts" setup>
const store = useSettingsStore()
</script>
