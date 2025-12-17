import { inject } from 'vue'

export const DialogSymbol = Symbol('UiDialog')

export function useDialogContext() {
  const ctx = inject(DialogSymbol, null)
  if (!ctx) {
    throw new Error('Dialog components must be used within <Dialog>.')
  }
  return ctx
}
