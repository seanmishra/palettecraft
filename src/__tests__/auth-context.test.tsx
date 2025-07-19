import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AuthProvider, useAuth } from '@/contexts/auth-context'

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabaseClient: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      signInWithOAuth: jest.fn(),
    }
  }
}))

// Test component that uses auth context
function TestComponent() {
  const { user, loading, signIn, signUp, signOut, signInWithProvider } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Loaded'}</div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => signUp('test@example.com', 'password')}>Sign Up</button>
      <button onClick={() => signOut()}>Sign Out</button>
      <button onClick={() => signInWithProvider('google')}>Sign In with Google</button>
    </div>
  )
}

describe('AuthContext', () => {
  it('should provide auth context values', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Initially loading
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loaded')
    })

    // No user initially
    expect(screen.getByTestId('user')).toHaveTextContent('No user')
  })

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')
    
    consoleSpy.mockRestore()
  })

  it('should have sign in functionality', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signInButton = screen.getByText('Sign In')
    expect(signInButton).toBeInTheDocument()
  })

  it('should have sign up functionality', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signUpButton = screen.getByText('Sign Up')
    expect(signUpButton).toBeInTheDocument()
  })

  it('should have sign out functionality', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signOutButton = screen.getByText('Sign Out')
    expect(signOutButton).toBeInTheDocument()
  })

  it('should have OAuth sign in functionality', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const oauthButton = screen.getByText('Sign In with Google')
    expect(oauthButton).toBeInTheDocument()
  })
})
