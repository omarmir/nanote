<template>
  <MilkdownProvider>
    <MilkdownFileEditor v-model="code" />
  </MilkdownProvider>
</template>

<script setup lang="ts">
import { MilkdownProvider } from '@milkdown/vue'
import MilkdownFileEditor from '~/components/MilkdownFileEditor.vue'

const code = ref('import { Editor } from "@milkdown/kit/core";')
</script>
