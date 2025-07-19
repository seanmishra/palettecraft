'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/app/components/catalyst-ui-kit/button'
import { Input } from '@/app/components/catalyst-ui-kit/input'
import { Heading } from '@/app/components/catalyst-ui-kit/heading'
import { Text } from '@/app/components/catalyst-ui-kit/text'
import { Fieldset, Field, Label } from '@/app/components/catalyst-ui-kit/fieldset'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
    } else {
      router.push('/')
    }
    
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    const { error } = await signUp(email, password)
    
    if (error) {
      if (error.message.includes('already registered')) {
        setError('This email is already registered. Please try signing in instead.')
      } else {
        setError(error.message)
      }
    } else {
      // Try to sign in immediately after successful sign-up
      const { error: signInError } = await signIn(email, password)
      if (signInError) {
        setError('Account created! Please check your email for verification, then try signing in.')
      } else {
        router.push('/')
      }
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-md w-full space-y-8 p-8 rounded-xl border shadow-xl" style={{ 
        background: 'var(--color-surface-secondary)', 
        borderColor: 'var(--color-border-primary)' 
      }}>
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">PC</span>
          </div>
          <Heading level={1} style={{ color: 'var(--color-text-primary)' }}>Sign in to PaletteCraft</Heading>
          <Text className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>Access your color palette dashboard</Text>
        </div>

        <form className="space-y-6">
          <Fieldset>
            <Field>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </Field>

            <Field>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </Field>
          </Fieldset>

          {error && (
            <div className="text-red-400 text-sm text-center border rounded-lg p-3" style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.3)'
            }}>
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button
              type="submit"
              onClick={handleSignIn}
              disabled={loading}
              color="indigo"
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              color="zinc"
              className="w-full"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>
        </form>

        <div className="text-center">
          <Text className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            Enter your email and password to sign in or create a new account
          </Text>
        </div>
      </div>
    </div>
  )
}
