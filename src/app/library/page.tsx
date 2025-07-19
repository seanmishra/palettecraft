'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabaseClient } from '@/lib/supabase'
import { Button } from '@/app/components/catalyst-ui-kit/button'
import { Heading } from '@/app/components/catalyst-ui-kit/heading'
import { Text } from '@/app/components/catalyst-ui-kit/text'
import { Input } from '@/app/components/catalyst-ui-kit/input'
import { Badge } from '@/app/components/catalyst-ui-kit/badge'
import { Dialog, DialogTitle, DialogDescription, DialogActions } from '@/app/components/catalyst-ui-kit/dialog'
import { ArrowDownTrayIcon, ShareIcon, TrashIcon, PencilIcon, EyeIcon, GlobeAltIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import type { Tables } from '@/types/database'

type Palette = Tables<'palettes'>

export default function LibraryPage() {
  const { user } = useAuth()
  const [palettes, setPalettes] = useState<Palette[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPalette, setSelectedPalette] = useState<Palette | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  const fetchPalettes = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabaseClient
        .from('palettes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPalettes(data || [])
    } catch (error) {
      console.error('Error fetching palettes:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchPalettes()
    }
  }, [user, fetchPalettes])

  const filteredPalettes = palettes.filter(palette =>
    palette.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const deletePalette = async () => {
    if (!selectedPalette) return

    try {
      const { error } = await supabaseClient
        .from('palettes')
        .delete()
        .eq('id', selectedPalette.id)

      if (error) throw error

      setPalettes(prev => prev.filter(p => p.id !== selectedPalette.id))
      setShowDeleteDialog(false)
      setSelectedPalette(null)
    } catch (error) {
      console.error('Error deleting palette:', error)
    }
  }

  const togglePublicStatus = async (palette: Palette) => {
    try {
      const { error } = await supabaseClient
        .from('palettes')
        .update({ is_public: !palette.is_public })
        .eq('id', palette.id)

      if (error) throw error

      setPalettes(prev => prev.map(p => 
        p.id === palette.id ? { ...p, is_public: !p.is_public } : p
      ))
    } catch (error) {
      console.error('Error updating palette:', error)
    }
  }

  const renamePalette = async (palette: Palette) => {
    if (!newName.trim()) return

    try {
      const { error } = await supabaseClient
        .from('palettes')
        .update({ name: newName.trim() })
        .eq('id', palette.id)

      if (error) throw error

      setPalettes(prev => prev.map(p => 
        p.id === palette.id ? { ...p, name: newName.trim() } : p
      ))
      setEditingName(null)
      setNewName('')
    } catch (error) {
      console.error('Error renaming palette:', error)
    }
  }

  const downloadTailwindConfig = (palette: Palette) => {
    if (!palette.tailwind_config) return

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

  const copyPaletteLink = (palette: Palette) => {
    const url = `${window.location.origin}/palette/${palette.id}`
    navigator.clipboard.writeText(url)
    alert('Palette link copied to clipboard!')
  }

  const copyLibraryLink = () => {
    const url = `${window.location.origin}/library/${user?.id}`
    navigator.clipboard.writeText(url)
    alert('Library link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <Text className="mt-2">Loading your palettes...</Text>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Heading level={1}>Your Palette Library</Heading>
          <Button onClick={copyLibraryLink}>
            <ShareIcon className="w-4 h-4" />
            Share Library
          </Button>
        </div>
        <Text>Manage your saved color palettes and generate Tailwind configurations.</Text>
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
        <div className="text-center py-12">
          <Text className="text-gray-500">
            {searchTerm ? 'No palettes found matching your search.' : 'No palettes saved yet. Go to Home to create your first palette!'}
          </Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPalettes.map((palette) => (
            <div key={palette.id} className="border rounded-lg p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                {editingName === palette.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onBlur={() => renamePalette(palette)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') renamePalette(palette)
                        if (e.key === 'Escape') {
                          setEditingName(null)
                          setNewName('')
                        }
                      }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <Heading level={3} className="truncate">{palette.name}</Heading>
                    <Button
                      plain
                      onClick={() => {
                        setEditingName(palette.id)
                        setNewName(palette.name)
                      }}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Badge color={palette.is_public ? 'green' : 'zinc'}>
                    {palette.is_public ? (
                      <>
                        <GlobeAltIcon className="w-3 h-3" />
                        Public
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="w-3 h-3" />
                        Private
                      </>
                    )}
                  </Badge>
                </div>
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
                    onClick={() => navigator.clipboard.writeText(color)}
                    title={`Click to copy ${color}`}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black bg-opacity-20 rounded flex items-center justify-center transition-opacity">
                      <Text className="text-white text-xs font-mono">{color}</Text>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex gap-2">
                  <Button
                    plain
                    onClick={() => togglePublicStatus(palette)}
                    title={palette.is_public ? 'Make private' : 'Make public'}
                  >
                    {palette.is_public ? <LockClosedIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </Button>
                  <Button
                    plain
                    onClick={() => copyPaletteLink(palette)}
                    disabled={!palette.is_public}
                    title="Copy share link"
                  >
                    <ShareIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    plain
                    onClick={() => downloadTailwindConfig(palette)}
                    disabled={!palette.tailwind_config}
                    title="Download Tailwind config"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  plain
                  onClick={() => {
                    setSelectedPalette(palette)
                    setShowDeleteDialog(true)
                  }}
                  title="Delete palette"
                >
                  <TrashIcon className="w-4 h-4 text-red-600" />
                </Button>
              </div>

              {/* Metadata */}
              <div className="text-xs text-gray-500">
                Created {new Date(palette.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Palette</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete &quot;{selectedPalette?.name}&quot;? This action cannot be undone.
        </DialogDescription>
        <DialogActions>
          <Button plain onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={deletePalette}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
