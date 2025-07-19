'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabaseClient } from '@/lib/supabase'
import { Button } from '@/app/components/catalyst-ui-kit/button'
import { Heading } from '@/app/components/catalyst-ui-kit/heading'
import { Text } from '@/app/components/catalyst-ui-kit/text'
import { Fieldset } from '@/app/components/catalyst-ui-kit/fieldset'
import { Switch } from '@/app/components/catalyst-ui-kit/switch'
import { Select } from '@/app/components/catalyst-ui-kit/select'
import type { Tables } from '@/types/database'

type UserSettings = Tables<'user_settings'>

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabaseClient
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error
      }

      if (data) {
        setSettings(data)
      } else {
        // Create default settings
        const defaultSettings = {
          user_id: user.id,
          theme: 'system' as const,
          auto_generate_tailwind: true,
          default_tailwind_version: '4' as const,
          auto_save_to_library: false,
          default_access: 'private' as const,
        }

        const { data: newSettings, error: createError } = await supabaseClient
          .from('user_settings')
          .insert(defaultSettings)
          .select()
          .single()

        if (createError) throw createError
        setSettings(newSettings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchSettings()
    }
  }, [user, fetchSettings])

  const updateSetting = async (key: keyof Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>, value: unknown) => {
    if (!settings) return

    try {
      const { error } = await supabaseClient
        .from('user_settings')
        .update({ [key]: value })
        .eq('id', settings.id)

      if (error) throw error

      setSettings(prev => prev ? { ...prev, [key]: value } : null)
    } catch (error) {
      console.error('Error updating setting:', error)
    }
  }

  const saveAllSettings = async () => {
    if (!settings) return

    setSaving(true)
    try {
      const { error } = await supabaseClient
        .from('user_settings')
        .update({
          theme: settings.theme,
          auto_generate_tailwind: settings.auto_generate_tailwind,
          default_tailwind_version: settings.default_tailwind_version,
          auto_save_to_library: settings.auto_save_to_library,
          default_access: settings.default_access,
        })
        .eq('id', settings.id)

      if (error) throw error
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <Text className="mt-2">Loading settings...</Text>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Text>Failed to load settings. Please try refreshing the page.</Text>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <Heading level={1}>Settings</Heading>
        <Text>Customize your PaletteCraft experience.</Text>
      </div>

      <div className="space-y-8">
        {/* Theme Settings */}
        <Fieldset>
          <legend className="text-base font-semibold leading-6 text-gray-900">
            Theme
          </legend>
          <Text className="mt-1 text-sm text-gray-600">
            Choose how PaletteCraft appears to you.
          </Text>
          
          <div className="mt-4">
            <Select
              value={settings.theme}
              onChange={(value) => updateSetting('theme', value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </Select>
          </div>
        </Fieldset>

        {/* Tailwind Configuration */}
        <Fieldset>
          <legend className="text-base font-semibold leading-6 text-gray-900">
            Tailwind CSS
          </legend>
          <Text className="mt-1 text-sm text-gray-600">
            Configure how Tailwind CSS configurations are generated.
          </Text>
          
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Text className="font-medium">Auto-generate Tailwind config</Text>
                <Text className="text-sm text-gray-600">
                  Automatically generate Tailwind CSS configuration when creating palettes.
                </Text>
              </div>
              <Switch
                checked={settings.auto_generate_tailwind}
                onChange={(checked) => updateSetting('auto_generate_tailwind', checked)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Tailwind version
              </label>
              <Select
                value={settings.default_tailwind_version}
                onChange={(value) => updateSetting('default_tailwind_version', value)}
              >
                <option value="3">Tailwind CSS v3</option>
                <option value="4">Tailwind CSS v4</option>
              </Select>
            </div>
          </div>
        </Fieldset>

        {/* Library Settings */}
        <Fieldset>
          <legend className="text-base font-semibold leading-6 text-gray-900">
            Library
          </legend>
          <Text className="mt-1 text-sm text-gray-600">
            Control how palettes are saved and shared.
          </Text>
          
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Text className="font-medium">Auto-save to library</Text>
                <Text className="text-sm text-gray-600">
                  Automatically save generated palettes to your library.
                </Text>
              </div>
              <Switch
                checked={settings.auto_save_to_library}
                onChange={(checked) => updateSetting('auto_save_to_library', checked)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default access for library items
              </label>
              <Select
                value={settings.default_access}
                onChange={(value) => updateSetting('default_access', value)}
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </Select>
              <Text className="mt-1 text-sm text-gray-600">
                Choose whether new palettes are private or public by default.
              </Text>
            </div>
          </div>
        </Fieldset>

        {/* Save Button */}
        <div className="pt-6 border-t border-gray-200">
          <Button
            color="blue"
            onClick={saveAllSettings}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}
