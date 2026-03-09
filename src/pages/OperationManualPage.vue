<template>
  <div class="h-full w-full overflow-auto bg-white">
    <MarkdownViewer :content="mdContent" />
  </div>
</template>

<script setup>
import MarkdownViewer from '@/components/MarkdownViewer.vue';
import mdContent from '@/pages/OperationManual.md?raw';
</script>
