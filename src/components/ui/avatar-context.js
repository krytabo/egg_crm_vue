import { inject } from 'vue'

export const AvatarSymbol = Symbol('UiAvatar')

export const useAvatarContext = () => inject(AvatarSymbol, null)
