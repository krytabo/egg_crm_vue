import { inject } from 'vue'

export const InputOTPSymbol = Symbol('UiInputOTP')

export function useInputOTP() {
  const ctx = inject(InputOTPSymbol, null)
  if (!ctx) {
    throw new Error('InputOTPSlot must be used inside <InputOTP>.')
  }
  return ctx
}
