'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/app/components/catalyst-ui-kit/navbar'
import { Button } from '@/app/components/catalyst-ui-kit/button'
import { Avatar } from '@/app/components/catalyst-ui-kit/avatar'
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/app/components/catalyst-ui-kit/dropdown'
import { useAuth } from '@/contexts/auth-context'
import { 
  HomeIcon, 
  BookOpenIcon, 
  Cog6ToothIcon, 
  UserIcon,
  DocumentTextIcon,
  MapIcon,
  ArrowRightEndOnRectangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Library', href: '/library', icon: BookOpenIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

const specialPages = [
  { name: 'Profile', href: '/profile', icon: UserIcon },
  { name: 'Changelog', href: '/changelog', icon: DocumentTextIcon },
  { name: 'Roadmap', href: '/roadmap', icon: MapIcon },
]

export function MainNavigation() {
  const { user, profile, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/sign-in')
  }

  return (
    <Navbar>
      <NavbarSection>
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">PC</span>
          </div>
          PaletteCraft
        </Link>
      </NavbarSection>

      <NavbarSection>
        {navigation.map((item) => (
          <NavbarItem 
            key={item.name} 
            href={item.href} 
            current={pathname === item.href}
          >
            <item.icon data-slot="icon" />
            {item.name}
          </NavbarItem>
        ))}
      </NavbarSection>

      <NavbarSpacer />

      <NavbarSection>
        {user ? (
          <Dropdown>
            <DropdownButton as={Button} outline>
              <Avatar
                src={profile?.avatar_url || undefined}
                alt={profile?.name || user.email || 'User'}
                initials={profile?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                data-slot="avatar"
              />
              {profile?.name || user.email}
            </DropdownButton>
            <DropdownMenu>
              <DropdownItem href="/profile">
                <UserIcon data-slot="icon" />
                Profile
              </DropdownItem>
              <DropdownItem onClick={handleSignOut}>
                <ArrowRightEndOnRectangleIcon data-slot="icon" />
                Sign Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <>
            <Button href="/auth/sign-in" outline>
              Sign In
            </Button>
            <Button href="/auth/sign-up">
              <PlusIcon data-slot="icon" />
              Get Started
            </Button>
          </>
        )}
      </NavbarSection>
    </Navbar>
  )
}
