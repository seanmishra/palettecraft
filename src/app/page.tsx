'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import ColorThief from 'colorthief'
import { Button } from '@/app/components/catalyst-ui-kit/button'
import { Heading } from '@/app/components/catalyst-ui-kit/heading'
import { Text } from '@/app/components/catalyst-ui-kit/text'
import { Input } from '@/app/components/catalyst-ui-kit/input'
import { useAuth } from '@/contexts/auth-context'
import { supabaseClient } from '@/lib/supabase'
import { generateTailwindConfig } from '@/lib/color-utils'
import { PhotoIcon, ArrowDownTrayIcon, BookmarkIcon } from '@heroicons/react/24/outline'

interface ColorPalette {
  colors: string[]
  name: string
  sourceImage?: string
  tailwindConfig?: object
}

export default function HomePage() {
  const { user } = useAuth()
  const [palette, setPalette] = useState<ColorPalette | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [paletteName, setPaletteName] = useState('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setLoading(true)
    try {
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file)
      setUploadedImage(imageUrl)

      // Extract colors using ColorThief
      const img = document.createElement('img')
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const colorThief = new ColorThief()
        const dominantColor = colorThief.getColor(img)
        const colorPalette = colorThief.getPalette(img, 8)
        
        // Convert RGB arrays to hex strings
        const colors = [dominantColor, ...colorPalette].map(rgb => 
          `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`
        )

        // Remove duplicates
        const uniqueColors = Array.from(new Set(colors))

        const newPalette: ColorPalette = {
          colors: uniqueColors,
          name: file.name.split('.')[0] || 'Untitled Palette',
          sourceImage: imageUrl,
          tailwindConfig: generateTailwindConfig(uniqueColors)
        }

        setPalette(newPalette)
        setPaletteName(newPalette.name)
        setLoading(false)
      }
      img.src = imageUrl
    } catch (error) {
      console.error('Error extracting colors:', error)
      setLoading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: false
  })

  const savePalette = async () => {
    if (!palette || !user) return

    setSaving(true)
    try {
      let sourceImageUrl = null

      // Upload image to Supabase storage if there's an uploaded image
      if (uploadedImage && uploadedImage.startsWith('blob:')) {
        const response = await fetch(uploadedImage)
        const blob = await response.blob()
        const fileExt = blob.type.split('/')[1]
        const fileName = `${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('palette-images')
          .upload(fileName, blob)

        if (uploadError) throw uploadError

        const { data: urlData } = supabaseClient.storage
          .from('palette-images')
          .getPublicUrl(uploadData.path)

        sourceImageUrl = urlData.publicUrl
      }

      // Save palette to database
      const { error } = await supabaseClient
        .from('palettes')
        .insert({
          user_id: user.id,
          name: paletteName,
          colors: palette.colors,
          source_image_url: sourceImageUrl,
          tailwind_config: palette.tailwindConfig,
          is_public: false
        })

      if (error) throw error

      alert('Palette saved successfully!')
    } catch (error) {
      console.error('Error saving palette:', error)
      alert('Failed to save palette')
    } finally {
      setSaving(false)
    }
  }

  const downloadTailwindConfig = () => {
    if (!palette?.tailwindConfig) return

    const configStr = JSON.stringify(palette.tailwindConfig, null, 2)
    const blob = new Blob([configStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${paletteName.replace(/\s+/g, '-').toLowerCase()}-tailwind-config.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <Heading level={1} style={{ color: 'var(--color-text-primary)' }}>Color Palette Generator</Heading>
        <Text style={{ color: 'var(--color-text-secondary)' }}>Upload an image to extract a beautiful color palette and generate Tailwind CSS configurations.</Text>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500'
            : 'hover:border-primary-400'
        }`}
        style={{
          backgroundColor: isDragActive ? 'rgba(168, 85, 247, 0.1)' : 'var(--color-surface-secondary)',
          borderColor: isDragActive ? undefined : 'var(--color-border-primary)'
        }}
      >
        <input {...getInputProps()} />
        <PhotoIcon className="mx-auto h-12 w-12" style={{ color: 'var(--color-text-tertiary)' }} />
        <div className="mt-4">
          {isDragActive ? (
            <Text className="text-primary-700">Drop the image here...</Text>
          ) : (
            <div>
              <Text className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Drop an image here, or click to select</Text>
              <Text style={{ color: 'var(--color-text-tertiary)' }}>PNG, JPG, GIF up to 10MB</Text>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <Text className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>Extracting colors...</Text>
        </div>
      )}

      {/* Results */}
      {palette && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <Heading level={2} style={{ color: 'var(--color-text-primary)' }}>Generated Palette</Heading>
            <div className="flex gap-2">
              <Button onClick={downloadTailwindConfig} color="zinc">
                <ArrowDownTrayIcon className="w-4 h-4" />
                Download Config
              </Button>
              <Button color="indigo" onClick={savePalette} disabled={saving}>
                <BookmarkIcon className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Palette'}
              </Button>
            </div>
          </div>

          {/* Palette Name Input */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Palette Name
            </label>
            <Input
              value={paletteName}
              onChange={(e) => setPaletteName(e.target.value)}
              placeholder="Enter palette name"
            />
          </div>

          {/* Source Image */}
          {uploadedImage && (
            <div>
              <Text className="font-medium mb-2">Source Image</Text>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uploadedImage}
                alt="Source"
                className="max-w-xs max-h-48 object-contain rounded-lg border"
              />
            </div>
          )}

          {/* Color Swatches */}
          <div>
            <Text className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Colors</Text>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {palette.colors.map((color, index) => (
                <div
                  key={index}
                  className="group cursor-pointer"
                  onClick={() => copyColor(color)}
                >
                  <div
                    className="w-full h-16 rounded-lg border shadow-sm group-hover:scale-105 transition-transform"
                    style={{ 
                      backgroundColor: color,
                      borderColor: 'var(--color-border-primary)' 
                    }}
                  />
                  <Text className="text-xs text-center mt-1 font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                    {color}
                  </Text>
                </div>
              ))}
            </div>
          </div>

          {/* Tailwind Config Preview */}
          {palette.tailwindConfig && (
            <div>
              <Text className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Tailwind Configuration</Text>
              <pre className="border p-4 rounded-lg overflow-x-auto text-sm" style={{
                backgroundColor: 'var(--color-surface-secondary)',
                borderColor: 'var(--color-border-primary)',
                color: 'var(--color-text-primary)'
              }}>
                {JSON.stringify(palette.tailwindConfig, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
