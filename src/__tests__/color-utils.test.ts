import {
  hexToRgb,
  rgbToHsl,
  getLuminance,
  getContrastRatio,
  generateColorName,
  generateTailwindConfig,
  generateColorVariations,
} from '@/lib/color-utils'

describe('Color Utilities', () => {
  describe('hexToRgb', () => {
    it('should convert hex to RGB correctly', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 })
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 })
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 })
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
    })

    it('should handle hex without # prefix', () => {
      expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('should return null for invalid hex', () => {
      expect(hexToRgb('#invalid')).toBeNull()
      expect(hexToRgb('not-hex')).toBeNull()
    })
  })

  describe('rgbToHsl', () => {
    it('should convert RGB to HSL correctly', () => {
      const result = rgbToHsl(255, 0, 0) // Red
      expect(result.h).toBeCloseTo(0)
      expect(result.s).toBeCloseTo(100)
      expect(result.l).toBeCloseTo(50)
    })

    it('should handle grayscale colors', () => {
      const result = rgbToHsl(128, 128, 128) // Gray
      expect(result.h).toBeCloseTo(0)
      expect(result.s).toBeCloseTo(0)
      expect(result.l).toBeCloseTo(50.2, 1)
    })
  })

  describe('getLuminance', () => {
    it('should calculate luminance correctly', () => {
      expect(getLuminance('#ffffff')).toBeCloseTo(1, 1) // White should be close to 1
      expect(getLuminance('#000000')).toBeCloseTo(0, 1) // Black should be close to 0
    })

    it('should handle invalid hex', () => {
      expect(getLuminance('invalid')).toBe(0)
    })
  })

  describe('getContrastRatio', () => {
    it('should calculate contrast ratio correctly', () => {
      const ratio = getContrastRatio('#ffffff', '#000000')
      expect(ratio).toBeCloseTo(21, 0) // White on black should be 21:1
    })

    it('should return 1 for same colors', () => {
      const ratio = getContrastRatio('#ff0000', '#ff0000')
      expect(ratio).toBeCloseTo(1, 1)
    })
  })

  describe('generateColorName', () => {
    it('should generate appropriate color names', () => {
      expect(generateColorName('#ff0000', 0)).toContain('red') // Red
      expect(generateColorName('#00ff00', 0)).toContain('green') // Green
      expect(generateColorName('#0000ff', 0)).toContain('blue') // Blue
      expect(generateColorName('#808080', 0)).toContain('gray') // Gray
    })

    it('should include lightness indicators', () => {
      expect(generateColorName('#ffcccc', 0)).toContain('100') // Light red  
      expect(generateColorName('#cc0000', 0)).toContain('600') // Dark red
    })

    it('should handle invalid hex', () => {
      expect(generateColorName('invalid', 0)).toBe('color-1')
    })
  })

  describe('generateTailwindConfig', () => {
    it('should generate valid Tailwind config', () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff']
      const config = generateTailwindConfig(colors)
      
      expect(config).toHaveProperty('extend')
      expect(config.extend).toHaveProperty('colors')
      expect(config.extend.colors).toHaveProperty('custom')
      expect(Object.keys(config.extend.colors.custom)).toHaveLength(3)
    })

    it('should handle empty color array', () => {
      const config = generateTailwindConfig([])
      expect(config.extend.colors.custom).toEqual({})
    })
  })

  describe('generateColorVariations', () => {
    it('should generate color variations', () => {
      const variations = generateColorVariations('#ff0000')
      expect(Object.keys(variations)).toHaveLength(9)
      expect(variations).toHaveProperty('100')
      expect(variations).toHaveProperty('500')
      expect(variations).toHaveProperty('900')
    })

    it('should handle invalid hex', () => {
      const variations = generateColorVariations('invalid')
      expect(variations).toEqual({})
    })
  })
})
