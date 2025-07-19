import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import LibraryPage from '@/app/library/page'

// Mock the auth context
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com' },
    loading: false,
  })
}))

// Mock Supabase client
const mockPalettes = [
  {
    id: '1',
    name: 'Test Palette',
    colors: ['#ff0000', '#00ff00', '#0000ff'],
    is_public: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    user_id: '1',
    source_image_url: null,
    tailwind_config: null,
  }
]

jest.mock('@/lib/supabase', () => ({
  supabaseClient: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: mockPalettes, error: null })),
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: mockPalettes, error: null })),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  }
}))

describe('LibraryPage', () => {
  it('should render the main heading', () => {
    render(<LibraryPage />)
    expect(screen.getByText('Your Palette Library')).toBeInTheDocument()
  })

  it('should render search input', () => {
    render(<LibraryPage />)
    expect(screen.getByPlaceholderText('Search palettes...')).toBeInTheDocument()
  })

  it('should render share library button', () => {
    render(<LibraryPage />)
    expect(screen.getByText('Share Library')).toBeInTheDocument()
  })

  it('should show loading state initially', () => {
    render(<LibraryPage />)
    expect(screen.getByText('Loading your palettes...')).toBeInTheDocument()
  })

  it('should render palette data after loading', async () => {
    render(<LibraryPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Palette')).toBeInTheDocument()
    })
  })
})
