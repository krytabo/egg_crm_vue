// 半結構化：將現有 EmailAutocomplete 包成 Semi Form 可用的欄位
import { defineComponent, h } from "vue";
import { withField } from "@kousum/semi-ui-vue";
import EmailAutocomplete from "./EmailAutocomplete.vue";

const RawSemiEmailField = defineComponent({
  name: "RawSemiEmailField",
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: ""
    },
    onChange: {
      type: Function,
      default: null
    },
    displayOnly: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { attrs }) {
    return () =>
      h(EmailAutocomplete, {
        ...attrs,
        modelValue: props.value ?? "",
        "onUpdate:modelValue": (val) => props.onChange?.(val),
        "display-only": props.displayOnly
      });
  }
});

export default withField(RawSemiEmailField, {
  valueKey: "modelValue",
  onKeyChangeFnName: "onUpdate:modelValue"
});
