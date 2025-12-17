import { inject } from 'vue'

export const FormFieldSymbol = Symbol('UiFormField')
export const FormItemSymbol = Symbol('UiFormItem')

export function useFormField() {
  const field = inject(FormFieldSymbol, null)
  const item = inject(FormItemSymbol, null)
  if (!field || !item) {
    throw new Error('useFormField must be used within <FormField> and <FormItem>.')
  }
  const baseId = item.id
  return {
    id: baseId,
    name: field.name,
    error: field.error,
    formItemId: `${baseId}-control`,
    formDescriptionId: `${baseId}-description`,
    formMessageId: `${baseId}-message`
  }
}
