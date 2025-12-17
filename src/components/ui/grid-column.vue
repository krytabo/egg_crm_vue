<script>
import { defineComponent, h } from 'vue'
import { GridColumn as TinyGridColumn } from '@opentiny/vue'

export default defineComponent({
  name: 'UiGridColumn',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(TinyGridColumn, attrs, slots)
  }
})
</script>
