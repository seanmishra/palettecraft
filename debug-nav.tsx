// Temporary debug file to test navigation
'use client'

import { 
  HomeIcon, 
  BookOpenIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline'

export function DebugNav() {
  return (
    <div className="p-4 border border-red-500">
      <h2>Debug Navigation</h2>
      <ul>
        <li className="flex items-center gap-2">
          <HomeIcon className="w-5 h-5" />
          Home
        </li>
        <li className="flex items-center gap-2">
          <BookOpenIcon className="w-5 h-5" />
          Library
        </li>
        <li className="flex items-center gap-2">
          <Cog6ToothIcon className="w-5 h-5" />
          Settings
        </li>
      </ul>
    </div>
  )
}
