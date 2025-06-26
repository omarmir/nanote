<template>
  <li
    draggable="true"
    @dragstart="onDragStart"
    @dragleave="onDragLeave"
    @dragover="onDragOver"
    @dragend="onDragEnd"
    @drop="onDrop">
    <slot></slot>
    <CommonDangerAlert v-if="error" class="mb-4 ml-6 mt-1">{{ error }}</CommonDangerAlert>
  </li>
</template>
<script lang="ts" setup>
import type { Note, Notebook } from '~/types/notebook'

const { item } = defineProps<{ item: Note | Notebook }>()

const { onDragLeave, onDragOver, onDragStart, onDrop, onDragEnd, error } = useDragItem(item)
</script>
