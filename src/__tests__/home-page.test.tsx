import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import HomePage from '@/app/page'

// Mock the auth context
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com' },
    loading: false,
  })
}))

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabaseClient: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({ error: null })),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => ({ data: { path: 'test.jpg' }, error: null })),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'http://test.com/test.jpg' } })),
      })),
    },
  }
}))

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: () => ({
    getRootProps: () => ({ 'data-testid': 'dropzone' }),
    getInputProps: () => ({ 'data-testid': 'file-input' }),
    isDragActive: false,
  })
}))

// Mock ColorThief
jest.mock('colorthief', () => {
  return jest.fn().mockImplementation(() => ({
    getColor: () => [255, 0, 0],
    getPalette: () => [[0, 255, 0], [0, 0, 255]],
  }))
})

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}))

describe('HomePage', () => {
  it('should render the main heading', () => {
    render(<HomePage />)
    expect(screen.getByText('Color Palette Generator')).toBeInTheDocument()
  })

  it('should render the upload area', () => {
    render(<HomePage />)
    expect(screen.getByText('Drop an image here, or click to select')).toBeInTheDocument()
  })

  it('should show supported file types', () => {
    render(<HomePage />)
    expect(screen.getByText('PNG, JPG, GIF up to 10MB')).toBeInTheDocument()
  })

  it('should render the dropzone', () => {
    render(<HomePage />)
    expect(screen.getByTestId('dropzone')).toBeInTheDocument()
  })
})
