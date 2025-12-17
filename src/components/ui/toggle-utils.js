import { cn } from './utils'

const variantClasses = {
  default: 'bg-transparent',
  outline: 'border border-gray-200 bg-transparent hover:bg-gray-100 hover:text-gray-900'
}

const sizeClasses = {
  default: 'h-9 min-w-9 px-2',
  sm: 'h-8 min-w-8 px-1.5',
  lg: 'h-10 min-w-10 px-2.5'
}

export const toggleVariants = ({ variant = 'default', size = 'default' } = {}) =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-blue-600 data-[state=on]:text-white',
    variantClasses[variant] || variantClasses.default,
    sizeClasses[size] || sizeClasses.default
  )
