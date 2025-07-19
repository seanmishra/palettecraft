'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabaseClient } from '@/lib/supabase'
import { Button } from '@/app/components/catalyst-ui-kit/button'
import { Heading } from '@/app/components/catalyst-ui-kit/heading'
import { Text } from '@/app/components/catalyst-ui-kit/text'
import { Input } from '@/app/components/catalyst-ui-kit/input'
import { Fieldset } from '@/app/components/catalyst-ui-kit/fieldset'
import { Avatar } from '@/app/components/catalyst-ui-kit/avatar'
import { PhotoIcon } from '@heroicons/react/24/outline'
import type { Tables } from '@/types/database'

type Profile = Tables<'profiles'>

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    public_url: '',
  })

  const fetchProfile = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error
      }

      if (data) {
        setProfile(data)
        setFormData({
          name: data.name || '',
          public_url: data.public_url || '',
        })
      } else {
        // Create profile
        const newProfile = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || '',
          avatar_url: user.user_metadata?.avatar_url || null,
          public_url: null,
        }

        const { data: createdProfile, error: createError } = await supabaseClient
          .from('profiles')
          .insert(newProfile)
          .select()
          .single()

        if (createError) throw createError
        setProfile(createdProfile)
        setFormData({
          name: createdProfile.name || '',
          public_url: createdProfile.public_url || '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user, fetchProfile])

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}.${fileExt}`

      const { error: uploadError } = await supabaseClient.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabaseClient.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const avatarUrl = urlData.publicUrl

      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const generatePublicUrl = () => {
    const baseUrl = formData.name
      ? formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      : `user-${user?.id?.slice(0, 8)}`
    
    setFormData(prev => ({ ...prev, public_url: baseUrl }))
  }

  const saveProfile = async () => {
    if (!profile || !user) return

    setSaving(true)
    try {
      const { error } = await supabaseClient
        .from('profiles')
        .update({
          name: formData.name,
          public_url: formData.public_url || null,
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile(prev => prev ? {
        ...prev,
        name: formData.name,
        public_url: formData.public_url || null,
      } : null)

      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <Text className="mt-2">Loading profile...</Text>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Text>Failed to load profile. Please try refreshing the page.</Text>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <Heading level={1}>Profile</Heading>
        <Text>Manage your account information and public profile.</Text>
      </div>

      <div className="space-y-8">
        {/* Avatar */}
        <Fieldset>
          <legend className="text-base font-semibold leading-6 text-gray-900">
            Profile Picture
          </legend>
          
          <div className="mt-4 flex items-center gap-6">
            <Avatar
              src={profile.avatar_url}
              className="h-20 w-20"
            />
            <div>
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <Button
                  disabled={uploading}
                >
                  <PhotoIcon className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Change Photo'}
                </Button>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <Text className="mt-1 text-sm text-gray-600">
                JPG, PNG, or GIF. Max size 5MB.
              </Text>
            </div>
          </div>
        </Fieldset>

        {/* Basic Information */}
        <Fieldset>
          <legend className="text-base font-semibold leading-6 text-gray-900">
            Basic Information
          </legend>
          
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                value={profile.email}
                disabled
                className="bg-gray-50"
              />
              <Text className="mt-1 text-sm text-gray-600">
                Email cannot be changed. Contact support if you need to update this.
              </Text>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your display name"
              />
            </div>
          </div>
        </Fieldset>

        {/* Public Profile */}
        <Fieldset>
          <legend className="text-base font-semibold leading-6 text-gray-900">
            Public Profile
          </legend>
          <Text className="mt-1 text-sm text-gray-600">
            Create a public URL for your palette library that others can view.
          </Text>
          
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Public URL
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                      palettecraft.com/u/
                    </span>
                    <Input
                      value={formData.public_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, public_url: e.target.value }))}
                      placeholder="your-username"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                <Button
                  onClick={generatePublicUrl}
                  disabled={!formData.name}
                >
                  Generate
                </Button>
              </div>
              {formData.public_url && (
                <Text className="mt-1 text-sm text-gray-600">
                  Your public library will be available at: palettecraft.com/u/{formData.public_url}
                </Text>
              )}
            </div>
          </div>
        </Fieldset>

        {/* Account Information */}
        <Fieldset>
          <legend className="text-base font-semibold leading-6 text-gray-900">
            Account Information
          </legend>
          
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Text className="font-medium">Account created</Text>
                <Text className="text-sm text-gray-600">
                  {new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <Text className="font-medium">Last updated</Text>
                <Text className="text-sm text-gray-600">
                  {new Date(profile.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </div>
            </div>
          </div>
        </Fieldset>

        {/* Save Button */}
        <div className="pt-6 border-t border-gray-200">
          <Button
            color="blue"
            onClick={saveProfile}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>
    </div>
  )
}
