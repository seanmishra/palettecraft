'use client'

import { useAuth } from '@/contexts/auth-context'
import { MainNavigation } from '@/components/navigation/sidebar-navigation'
import { Button } from '@/app/components/catalyst-ui-kit/button'
import { SidebarLayout } from '@/app/components/catalyst-ui-kit/sidebar-layout'
import { Sidebar, SidebarHeader, SidebarBody, SidebarFooter } from '@/app/components/catalyst-ui-kit/sidebar'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user && pathname !== '/auth/sign-in') {
      router.push('/auth/sign-in')
    }
  }, [loading, user, router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Show children for auth pages, otherwise redirect handled by useEffect
    if (pathname === '/auth/sign-in') {
      return <>{children}</>
    }
    return null
  }

  return (
    <SidebarLayout
      navbar={
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>PaletteCraft</h1>
        </div>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>PaletteCraft</h1>
          </SidebarHeader>
          <SidebarBody>
            <MainNavigation />
          </SidebarBody>
          <SidebarFooter>
            <div className="text-sm text-gray-600 mb-2">{user.email}</div>
            <Button plain onClick={signOut} className="w-full justify-start text-left">
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  )
}
