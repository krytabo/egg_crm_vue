<!-- src/components/SvgIcon.vue -->
<template>
  <svg aria-hidden="true" :class="$attrs.class">
    <use :href="symbolId" :fill="color" />
  </svg>
</template>

<script>
import { defineComponent, computed } from "vue";

export default defineComponent({
  name: "SvgIcon",
  props: {
    prefix: {
      type: String,
      default: "icon"
    },
    name: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: "#333"
    }
  },
  setup(props) {
    const symbolId = computed(() => `#icon-${props.name}`);
    return { symbolId };
  }
});
</script>
