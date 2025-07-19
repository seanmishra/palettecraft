'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabaseClient } from '@/lib/supabase'
import { Heading } from '@/app/components/catalyst-ui-kit/heading'
import { Text } from '@/app/components/catalyst-ui-kit/text'
import { Input } from '@/app/components/catalyst-ui-kit/input'
import { Badge } from '@/app/components/catalyst-ui-kit/badge'
import { Button } from '@/app/components/catalyst-ui-kit/button'
import { ShareIcon, EyeIcon } from '@heroicons/react/24/outline'
import type { Tables } from '@/types/database'
import { notFound } from 'next/navigation'

type Palette = Tables<'palettes'>
type Profile = Tables<'profiles'>

interface PublicLibraryPageProps {
  params: {
    userId: string
  }
}

export default function PublicLibraryPage({ params }: PublicLibraryPageProps) {
  const [palettes, setPalettes] = useState<Palette[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', params.userId)
        .single()

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          setError('User not found')
        } else {
          throw profileError
        }
        return
      }

      setProfile(profileData)

      // Fetch public palettes
      const { data: palettesData, error: palettesError } = await supabaseClient
        .from('palettes')
        .select('*')
        .eq('user_id', params.userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (palettesError) throw palettesError

      setPalettes(palettesData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load library')
    } finally {
      setLoading(false)
    }
  }, [params.userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredPalettes = palettes.filter(palette =>
    palette.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const copyLibraryLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Library link copied to clipboard!')
  }

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <Text className="mt-2">Loading library...</Text>
        </div>
      </div>
    )
  }

  if (error || !profile) {
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
            <Button onClick={copyLibraryLink}>
              <ShareIcon className="w-4 h-4" />
              Share Library
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl p-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex items-center gap-6">
            {profile.avatar_url && (
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatar_url}
                  alt={`${profile.name || 'User'} avatar`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <Heading level={1} className="mb-2">
                {profile.name || 'Anonymous User'}&apos;s Color Library
              </Heading>
              <Text className="text-gray-600 mb-4">
                Public collection of color palettes created with PaletteCraft
              </Text>
              <div className="flex items-center gap-2">
                <Badge color="green">
                  <EyeIcon className="w-3 h-3" />
                  Public Library
                </Badge>
                <Text className="text-sm text-gray-500">
                  {palettes.length} {palettes.length === 1 ? 'palette' : 'palettes'}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search palettes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Palettes Grid */}
        {filteredPalettes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Text className="text-gray-500">
              {searchTerm 
                ? 'No palettes found matching your search.' 
                : 'No public palettes available.'
              }
            </Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPalettes.map((palette) => (
              <div key={palette.id} className="bg-white border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <Heading level={3} className="truncate flex-1">{palette.name}</Heading>
                  <Button
                    plain
                    href={`/palette/${palette.id}`}
                    className="ml-2"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Button>
                </div>

                {/* Source Image */}
                {palette.source_image_url && (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={palette.source_image_url}
                      alt={`Source for ${palette.name}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}

                {/* Color Swatches */}
                <div className="grid grid-cols-4 gap-2">
                  {palette.colors.slice(0, 8).map((color, index) => (
                    <div
                      key={index}
                      className="h-8 rounded cursor-pointer group relative"
                      style={{ backgroundColor: color }}
                      onClick={() => copyColor(color)}
                      title={`Click to copy ${color}`}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black bg-opacity-20 rounded flex items-center justify-center transition-opacity">
                        <Text className="text-white text-xs font-mono">{color}</Text>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between pt-2 border-t text-xs text-gray-500">
                  <span>
                    {new Date(palette.created_at).toLocaleDateString()}
                  </span>
                  <span>{palette.colors.length} colors</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center p-8 bg-blue-50 rounded-lg">
          <Heading level={3} className="mb-2">Create Your Own Color Library</Heading>
          <Text className="text-gray-600 mb-4">
            Generate beautiful color palettes from your images and build your own public library
          </Text>
          <Button color="blue" href="/">
            Get Started Free
          </Button>
        </div>
      </main>
    </div>
  )
}
