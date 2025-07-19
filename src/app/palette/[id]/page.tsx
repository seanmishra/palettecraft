'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabaseClient } from '@/lib/supabase'
import { Button } from '@/app/components/catalyst-ui-kit/button'
import { Heading } from '@/app/components/catalyst-ui-kit/heading'
import { Text } from '@/app/components/catalyst-ui-kit/text'
import { Badge } from '@/app/components/catalyst-ui-kit/badge'
import { ArrowDownTrayIcon, ShareIcon, EyeIcon } from '@heroicons/react/24/outline'
import type { Tables } from '@/types/database'
import { notFound } from 'next/navigation'

type Palette = Tables<'palettes'>

interface PublicPalettePageProps {
  params: {
    id: string
  }
}

export default function PublicPalettePage({ params }: PublicPalettePageProps) {
  const [palette, setPalette] = useState<Palette | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPalette = useCallback(async () => {
    try {
      const { data, error } = await supabaseClient
        .from('palettes')
        .select('*')
        .eq('id', params.id)
        .eq('is_public', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Palette not found or is not public')
        } else {
          throw error
        }
        return
      }

      setPalette(data)
    } catch (error) {
      console.error('Error fetching palette:', error)
      setError('Failed to load palette')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchPalette()
  }, [fetchPalette])

  const downloadTailwindConfig = () => {
    if (!palette?.tailwind_config) return

    const configStr = JSON.stringify(palette.tailwind_config, null, 2)
    const blob = new Blob([configStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${palette.name.replace(/\s+/g, '-').toLowerCase()}-tailwind-config.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyPaletteLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Palette link copied to clipboard!')
  }

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <Text className="mt-2">Loading palette...</Text>
        </div>
      </div>
    )
  }

  if (error || !palette) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">PaletteCraft</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge color="green">
                <EyeIcon className="w-3 h-3" />
                Public
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl p-6">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Heading level={1}>{palette.name}</Heading>
              <div className="flex gap-2">
                <Button onClick={copyPaletteLink}>
                  <ShareIcon className="w-4 h-4" />
                  Share
                </Button>
                {palette.tailwind_config && (
                  <Button color="blue" onClick={downloadTailwindConfig}>
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Download Config
                  </Button>
                )}
              </div>
            </div>
            <Text className="text-gray-600">
              A beautiful color palette created with PaletteCraft
            </Text>
          </div>

          {/* Source Image */}
          {palette.source_image_url && (
            <div className="mb-8">
              <Text className="font-medium mb-4">Source Image</Text>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={palette.source_image_url}
                alt={`Source for ${palette.name}`}
                className="max-w-md max-h-64 object-contain rounded-lg border shadow-sm"
              />
            </div>
          )}

          {/* Color Palette */}
          <div className="mb-8">
            <Text className="font-medium mb-4">Color Palette</Text>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {palette.colors.map((color, index) => (
                <div
                  key={index}
                  className="group cursor-pointer"
                  onClick={() => copyColor(color)}
                  title={`Click to copy ${color}`}
                >
                  <div
                    className="w-full h-24 rounded-lg border shadow-sm group-hover:scale-105 transition-transform relative"
                    style={{ backgroundColor: color }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center transition-opacity">
                      <Text className="text-white text-xs font-mono">Copy</Text>
                    </div>
                  </div>
                  <Text className="text-xs text-center mt-2 font-mono text-gray-600">
                    {color}
                  </Text>
                </div>
              ))}
            </div>
          </div>

          {/* Tailwind Config */}
          {palette.tailwind_config && (
            <div className="mb-8">
              <Text className="font-medium mb-4">Tailwind CSS Configuration</Text>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  {JSON.stringify(palette.tailwind_config, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t pt-6">
            <Text className="text-sm text-gray-500">
              Created on {new Date(palette.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center p-6 bg-blue-50 rounded-lg">
          <Heading level={3} className="mb-2">Create Your Own Palettes</Heading>
          <Text className="text-gray-600 mb-4">
            Generate beautiful color palettes from your images with PaletteCraft
          </Text>
          <Button color="blue" href="/">
            Get Started Free
          </Button>
        </div>
      </main>
    </div>
  )
}
