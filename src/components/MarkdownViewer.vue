<template>
  <div class="markdown-body p-6" v-html="renderedContent"></div>
</template>

<script setup>
import { computed, onMounted, nextTick, watch } from 'vue';
import MarkdownIt from 'markdown-it';
import mermaid from 'mermaid';

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
});

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

// Custom renderer for mermaid code blocks
const defaultFence = md.renderer.rules.fence;
md.renderer.rules.fence = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const info = token.info ? md.utils.unescapeAll(token.info).trim() : '';

  if (info === 'mermaid') {
    return `<div class="mermaid">${token.content}</div>`;
  }

  return defaultFence(tokens, idx, options, env, self);
};

const renderedContent = computed(() => {
  return md.render(props.content || '');
});

const initMermaid = async () => {
  // Initialize mermaid but don't auto-start, we manipulate DOM manually
  mermaid.initialize({ startOnLoad: false, theme: 'default' });
  await nextTick();
  // Run mermaid on all elements with class .mermaid
  await mermaid.run({
    querySelector: '.mermaid',
  });
};

onMounted(() => {
  initMermaid();
});

watch(
  () => props.content,
  () => {
    initMermaid();
  },
);
</script>

<style scoped>
/* Basic Typography styles to mimic prose since we might not have @tailwindcss/typography */
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
  color: #24292e;
  line-height: 1.6;
}

.markdown-body :deep(h1) {
  font-size: 2em;
  font-weight: 600;
  margin-bottom: 0.5em;
  margin-top: 1em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}
.markdown-body :deep(h2) {
  font-size: 1.5em;
  font-weight: 600;
  margin-bottom: 0.5em;
  margin-top: 1.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}
.markdown-body :deep(h3) {
  font-size: 1.25em;
  font-weight: 600;
  margin-bottom: 0.5em;
  margin-top: 1em;
}
.markdown-body :deep(p) {
  margin-bottom: 1em;
}
.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 2em;
  margin-bottom: 1em;
}
.markdown-body :deep(ul) {
  list-style-type: disc;
}
.markdown-body :deep(ol) {
  list-style-type: decimal;
}
.markdown-body :deep(li) {
  margin-bottom: 0.25em;
}
.markdown-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1em;
  display: block;
  overflow-x: auto;
}
.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid #dfe2e5;
  padding: 6px 13px;
}
.markdown-body :deep(th) {
  background-color: #f6f8fa;
  font-weight: 600;
}
.markdown-body :deep(tr:nth-child(2n)) {
  background-color: #f6f8fa;
}
.markdown-body :deep(blockquote) {
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  padding: 0 1em;
  margin: 1em 0;
}
.markdown-body :deep(code) {
  background-color: rgba(27, 31, 35, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 85%;
}
.markdown-body :deep(pre) {
  background-color: #f6f8fa;
  padding: 16px;
  overflow: auto;
  border-radius: 3px;
  margin-bottom: 1em;
}
.markdown-body :deep(pre code) {
  padding: 0;
  background-color: transparent;
  font-size: 100%;
}
.markdown-body :deep(a) {
  color: #0366d6;
  text-decoration: none;
}
.markdown-body :deep(a:hover) {
  text-decoration: underline;
}
.markdown-body :deep(img) {
  max-width: 100%;
  box-sizing: content-box;
  background-color: #fff;
  margin: 1em 0;
}
.markdown-body :deep(hr) {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #e1e4e8;
  border: 0;
}
</style>
