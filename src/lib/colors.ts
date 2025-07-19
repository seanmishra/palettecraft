/**
 * PaletteCraft Color System
 * 
 * A streamlined color system that leverages Tailwind's built-in colors while adding
 * custom brand colors. Use Tailwind's built-in colors (slate, indigo, emerald, amber, red)
 * for most UI elements, and our custom primary colors for brand-specific elements.
 */

export const colors = {
  // Custom Brand Primary - Purple/Violet for PaletteCraft branding
  // Available as: bg-primary-500, text-primary-600, border-primary-300, etc.
  primary: {
    50: 'var(--color-primary-50)',
    100: 'var(--color-primary-100)',
    200: 'var(--color-primary-200)',
    300: 'var(--color-primary-300)',
    400: 'var(--color-primary-400)',
    500: 'var(--color-primary-500)',
    600: 'var(--color-primary-600)',
    700: 'var(--color-primary-700)',
    800: 'var(--color-primary-800)',
    900: 'var(--color-primary-900)',
    950: 'var(--color-primary-950)',
  },
} as const

/**
 * Helper function to get a color value
 * @param colorPath - Dot notation path to the color (e.g., 'primary.500')
 * @returns CSS custom property value
 */
export function getColor(colorPath: string): string {
  const parts = colorPath.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = colors
  
  for (const part of parts) {
    current = current[part]
    if (!current) {
      console.warn(`Color path "${colorPath}" not found`)
      return 'transparent'
    }
  }
  
  return current
}

/**
 * Predefined color combinations for common UI patterns
 * Uses our custom primary brand colors and Tailwind's built-in colors
 */
export const colorCombinations = {
  // Button variants
  primaryButton: {
    background: 'bg-primary-500',
    text: 'text-white',
    hover: 'hover:bg-primary-600',
  },
  
  secondaryButton: {
    background: 'bg-indigo-500',
    text: 'text-white', 
    hover: 'hover:bg-indigo-600',
  },
  
  successButton: {
    background: 'bg-emerald-500',
    text: 'text-white',
    hover: 'hover:bg-emerald-600',
  },
  
  dangerButton: {
    background: 'bg-red-500',
    text: 'text-white',
    hover: 'hover:bg-red-600',
  },

  // Status indicators
  success: {
    background: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  
  warning: {
    background: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  
  error: {
    background: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },

  // Cards and containers
  card: {
    background: 'bg-white',
    border: 'border-gray-300',
    text: 'text-slate-900',
  },
  
  cardHover: {
    background: 'bg-gray-50',
    border: 'border-gray-400',
  },
} as const

/**
 * Recommended Tailwind color usage for different UI elements
 * This helps maintain consistency while leveraging Tailwind's extensive color palette
 */
export const tailwindColorRecommendations = {
  // Use these Tailwind colors for common UI patterns
  
  // Secondary actions and highlights
  secondary: 'indigo', // indigo-500, indigo-600, etc.
  
  // Success states and positive actions
  success: 'emerald', // emerald-500, emerald-600, etc.
  
  // Warning states and attention  
  warning: 'amber', // amber-500, amber-600, etc.
  
  // Error states and destructive actions
  error: 'red', // red-500, red-600, etc.
  
  // Neutral content, text, and borders
  neutral: 'slate', // slate-500, slate-600, etc.
  
  // Alternative neutrals for variety
  neutralAlt: 'zinc', // zinc-500, zinc-600, etc.
  
  // Information and links
  info: 'blue', // blue-500, blue-600, etc.
  
  // Special highlights or accents
  accent: 'cyan', // cyan-500, cyan-600, etc.
} as const
