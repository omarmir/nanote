<template>
  <div>
    <CommonBaseCard class="px-4 pb-2 pt-5 lg:px-9">
      <h3 class="text-dark m-2 ml-0 flex flex-col items-start justify-center">
        <span class="mr-3 text-lg font-medium dark:text-gray-300">Settings</span>
        <span class="font-base mt-1 text-sm text-gray-600 dark:text-gray-400">Customize your nanote experience</span>
      </h3>
      <div class="my-2">
        <div class="grid grid-cols-2 gap-4">
          <div>Hide note date and time</div>
          <div class="flex place-content-end">
            <CommonToggleBox v-model="collapse">
              <span class="hidden">Hide note date and time</span>
            </CommonToggleBox>
          </div>
          <div>Paragraph spacing</div>
          <div class="flex place-content-end">
            <CommonSliderInput v-model="paraSpacing" class="w-full max-w-sm">
              <span class="hidden">Paragraph spacing</span>
            </CommonSliderInput>
          </div>
        </div>
      </div>
    </CommonBaseCard>
  </div>
</template>
<script lang="ts" setup>
const collapse = ref(false)
const paraSpacing = ref(0)
</script>
