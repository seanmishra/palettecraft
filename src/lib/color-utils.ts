import ColorThief from 'colorthief'

export interface ColorPalette {
  colors: string[]
  dominantColor: string
}

export function extractPalette(imageElement: HTMLImageElement, colorCount = 5): ColorPalette {
  const colorThief = new ColorThief()
  
  // Get dominant color
  const dominantRgb = colorThief.getColor(imageElement)
  const dominantColor = `#${((1 << 24) + (dominantRgb[0] << 16) + (dominantRgb[1] << 8) + dominantRgb[2]).toString(16).slice(1)}`
  
  // Get color palette
  const paletteRgb = colorThief.getPalette(imageElement, colorCount)
  const colors = paletteRgb.map((rgb: number[]) => 
    `#${((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1)}`
  )
  
  return {
    colors,
    dominantColor
  }
}

/**
 * Color utility functions for PaletteCraft
 */

export interface TailwindColorConfig {
  extend: {
    colors: {
      custom: {
        [key: string]: string
      }
    }
  }
}

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h: number
  let s: number
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
      default: h = 0
    }

    h /= 6
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

/**
 * Calculate color luminance for contrast checking
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0

  const { r, g, b } = rgb
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05)
}

/**
 * Generate semantic color names based on HSL values
 */
export function generateColorName(hex: string, index: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return `color-${index + 1}`

  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b)

  // Determine base color name from hue
  let baseName = 'gray'
  if (s > 20) { // Only assign color names if there's some saturation
    if (h >= 0 && h < 15 || h >= 345) baseName = 'red'
    else if (h >= 15 && h < 45) baseName = 'orange'
    else if (h >= 45 && h < 75) baseName = 'yellow'
    else if (h >= 75 && h < 150) baseName = 'green'
    else if (h >= 150 && h < 210) baseName = 'cyan'
    else if (h >= 210 && h < 270) baseName = 'blue'
    else if (h >= 270 && h < 330) baseName = 'purple'
    else if (h >= 330 && h < 345) baseName = 'pink'
  }

  // Add lightness modifier
  if (l < 20) return `${baseName}-900`
  else if (l < 30) return `${baseName}-800`
  else if (l < 40) return `${baseName}-700`
  else if (l < 50) return `${baseName}-600`
  else if (l < 60) return `${baseName}-500`
  else if (l < 70) return `${baseName}-400`
  else if (l < 80) return `${baseName}-300`
  else if (l < 90) return `${baseName}-200`
  else return `${baseName}-100`
}

/**
 * Generate Tailwind CSS configuration from color palette
 */
export function generateTailwindConfig(colors: string[]): TailwindColorConfig {
  const colorConfig: { [key: string]: string } = {}

  colors.forEach((color, index) => {
    const colorName = generateColorName(color, index)
    colorConfig[colorName] = color
  })

  return {
    extend: {
      colors: {
        custom: colorConfig
      }
    }
  }
}

/**
 * Generate color variations (lighter/darker shades)
 */
export function generateColorVariations(hex: string): { [key: string]: string } {
  const rgb = hexToRgb(hex)
  if (!rgb) return {}

  const variations: { [key: string]: string } = {}
  const { h, s } = rgbToHsl(rgb.r, rgb.g, rgb.b)

  // Generate 9 variations from 100 to 900
  for (let i = 1; i <= 9; i++) {
    const lightness = 95 - (i - 1) * 10 // 95, 85, 75, 65, 55, 45, 35, 25, 15
    const adjustedL = Math.max(5, Math.min(95, lightness))
    
    // Convert back to hex
    const color = hslToHex(h, s, adjustedL)
    variations[`${i}00`] = color
  }

  return variations
}

/**
 * Convert HSL to hex
 */
function hslToHex(h: number, s: number, l: number): string {
  h = h / 360
  s = s / 100
  l = l / 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h * 6) % 2 - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0

  if (0 <= h && h < 1/6) {
    r = c; g = x; b = 0
  } else if (1/6 <= h && h < 1/3) {
    r = x; g = c; b = 0
  } else if (1/3 <= h && h < 1/2) {
    r = 0; g = c; b = x
  } else if (1/2 <= h && h < 2/3) {
    r = 0; g = x; b = c
  } else if (2/3 <= h && h < 5/6) {
    r = x; g = 0; b = c
  } else if (5/6 <= h && h < 1) {
    r = c; g = 0; b = x
  }

  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Optimize image for storage (resize and compress)
 */
export function optimizeImageForStorage(file: File, maxWidth = 800, maxHeight = 600, quality = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = document.createElement('img')

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
      }, 'image/jpeg', quality)
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Download Tailwind CSS configuration as a file
 */
export function downloadTailwindConfig(config: Record<string, unknown>, filename = 'tailwind.config.js') {
  const configString = `/** @type {import('tailwindcss').Config} */
module.exports = ${JSON.stringify(config, null, 2)}`
  
  const blob = new Blob([configString], { type: 'application/javascript' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
