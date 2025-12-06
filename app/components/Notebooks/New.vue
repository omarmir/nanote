<template>
  <UModal>
    <UButton icon="i-lucide-plus" size="md" color="neutral" variant="outline" :title="t('newNotebook')">
      {{ t('Notebook', 1) }}
    </UButton>
    <template #content>
      <UForm :schema="schema" :state="state" class="w-full p-4" @submit="onSubmit">
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

type Schema = v.InferOutput<typeof schema>

// Forbidden characters across Windows, Linux, and macOS
// Windows: < > : " / \ | ? *
// Also forbidden: leading/trailing spaces or periods, names ending with space
// Reserved names on Windows: CON, PRN, AUX, NUL, COM1-9, LPT1-9
// eslint-disable-next-line no-control-regex
const forbiddenChars = /[<>:"/\\|?*\x00-\x1f]/
const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i

const schema = v.pipe(
  v.object({
    name: v.pipe(
      v.string(),
      v.trim(),
      v.nonEmpty('Notebook name is required'),
      v.maxLength(255, 'Name must be 255 characters or less'),
      v.check((name) => !forbiddenChars.test(name), 'Name contains invalid characters (< > : " / \\ | ? *)'),
      v.check((name) => !reservedNames.test(name), 'Name cannot be a reserved system name'),
      v.check((name) => !name.endsWith('.'), 'Name cannot end with a period'),
      v.check((name) => name === name.trim(), 'Name cannot have leading or trailing spaces')
    )
  })
)

const state = reactive({
  name: ''
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({ title: 'Success', description: 'Notebook created successfully.', color: 'success' })
  console.log(event.data)
}
</script>
