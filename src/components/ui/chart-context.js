import { inject } from 'vue'

export const ChartSymbol = Symbol('UiChart')

export function useChart() {
  const ctx = inject(ChartSymbol, null)
  if (!ctx) {
    throw new Error('useChart must be used inside <ChartContainer>.')
  }
  return ctx
}
