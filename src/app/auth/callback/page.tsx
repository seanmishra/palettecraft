'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabaseClient.auth.getSession()
      
      if (error) {
        console.error('Auth callback error:', error)
        router.push('/auth/error')
        return
      }

      if (data.session) {
        router.push('/')
      } else {
        router.push('/auth/sign-in')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}
