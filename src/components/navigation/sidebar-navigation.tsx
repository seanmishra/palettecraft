'use client'

import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  BookOpenIcon, 
  Cog6ToothIcon, 
  UserIcon,
  DocumentTextIcon,
  MapIcon
} from '@heroicons/react/24/outline'
import { SidebarSection, SidebarItem } from '@/app/components/catalyst-ui-kit/sidebar'

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
  const pathname = usePathname()

  return (
    <>
      <SidebarSection>
        {navigation.map((item) => (
          <SidebarItem 
            key={item.name} 
            href={item.href} 
            current={pathname === item.href}
          >
            <item.icon data-slot="icon" />
            {item.name}
          </SidebarItem>
        ))}
      </SidebarSection>
      
      <SidebarSection>
        {specialPages.map((item) => (
          <SidebarItem 
            key={item.name} 
            href={item.href} 
            current={pathname === item.href}
          >
            <item.icon data-slot="icon" />
            {item.name}
          </SidebarItem>
        ))}
      </SidebarSection>
    </>
  )
}
