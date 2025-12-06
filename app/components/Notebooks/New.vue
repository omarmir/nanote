<template>
  <UModal>
    <UButton icon="i-lucide-plus" size="md" color="neutral" variant="outline" :title="t('newNotebook')">
      {{ t('Notebook', 1) }}
    </UButton>
    <template #content>
      <UForm :schema="NewNotebookSchema" :state="state" class="w-full p-4" @submit="onSubmit">
        <UFormField :label="t('notebookName')" name="name" class="w-full">
          <div class="flex w-full flex-row items-center gap-2">
            <UInput v-model="state.name" class="w-full" :placeholder="t('notebookName')" />
            <UButton type="submit">Create</UButton>
          </div>
        </UFormField>
      </UForm>
    </template>
  </UModal>
</template>
<script lang="ts" setup>
import * as v from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'
const { t } = useI18n()

const state = reactive({
  name: ''
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<NewNotebook>) {
  toast.add({ title: 'Success', description: 'Notebook created successfully.', color: 'success' })
  console.log(event.data)
}
</script>
