import { defineComponent, h } from 'vue'
import { cn } from './utils'

// Factory helper to cut down on boilerplate for simple presentational components
export function createSimpleComponent(name, tag = 'div', baseClass = '') {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { slots, attrs }) {
      return () =>
        h(
          tag,
          {
            ...attrs,
            class: cn(baseClass, attrs.class)
          },
          slots.default?.()
        )
    }
  })
}

export const SimpleDiv = createSimpleComponent('UiSimpleDiv', 'div')
export const SimpleSpan = createSimpleComponent('UiSimpleSpan', 'span')
