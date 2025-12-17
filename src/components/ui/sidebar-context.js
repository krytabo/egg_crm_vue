import { inject } from 'vue'

export const SidebarSymbol = Symbol('UiSidebar')

export function useSidebar() {
  const ctx = inject(SidebarSymbol, null)
  if (!ctx) {
    throw new Error('useSidebar must be used within <SidebarProvider>.')
  }
  return ctx
}
