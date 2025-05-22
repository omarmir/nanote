<template>
  <div>
    <NuxtCodeMirror
      ref="codemirror"
      v-model="code"
      :theme="'dark'"
      style="width: 500px; height: 400px"
      placeholder="Enter your code here..."
      :auto-focus="true"
      :editable="true"
      :basic-setup="true"
      :indent-with-tab="true" />
  </div>
</template>
<script lang="ts" setup>
const code = ref('import thing')
</script>
