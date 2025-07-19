import { Heading } from '@/app/components/catalyst-ui-kit/heading'
import { Text } from '@/app/components/catalyst-ui-kit/text'
import { Badge } from '@/app/components/catalyst-ui-kit/badge'

const changelog = [
  {
    version: '1.0.0',
    date: '2025-01-15',
    type: 'release',
    changes: [
      'Initial release of PaletteCraft',
      'Color palette generation from images using ColorThief',
      'Tailwind CSS configuration generation',
      'User authentication with Supabase',
      'Palette library management',
      'Public/private palette sharing',
      'Theme and settings customization',
    ],
  },
  {
    version: '0.9.0',
    date: '2025-01-10',
    type: 'beta',
    changes: [
      'Added user profile management',
      'Implemented image optimization for storage',
      'Added public library sharing functionality',
      'Enhanced color extraction algorithms',
    ],
  },
  {
    version: '0.8.0',
    date: '2025-01-05',
    type: 'beta',
    changes: [
      'Added settings page with theme controls',
      'Implemented auto-save functionality',
      'Added Tailwind version selection (v3/v4)',
      'Improved color naming and categorization',
    ],
  },
  {
    version: '0.7.0',
    date: '2025-01-01',
    type: 'alpha',
    changes: [
      'Initial palette library implementation',
      'Added drag-and-drop image upload',
      'Implemented basic color extraction',
      'Added user authentication',
    ],
  },
]

export default function ChangelogPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <Heading level={1}>Changelog</Heading>
        <Text>Stay up to date with the latest features, improvements, and bug fixes.</Text>
      </div>

      <div className="space-y-8">
        {changelog.map((release) => (
          <div key={release.version} className="border-l-4 border-blue-500 pl-6">
            <div className="flex items-center gap-3 mb-3">
              <Heading level={2} className="text-xl">
                Version {release.version}
              </Heading>
              <Badge 
                color={
                  release.type === 'release' ? 'green' : 
                  release.type === 'beta' ? 'blue' : 
                  'orange'
                }
              >
                {release.type}
              </Badge>
              <Text className="text-gray-500">
                {new Date(release.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </div>
            
            <ul className="space-y-2">
              {release.changes.map((change, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 text-sm mt-1">✓</span>
                  <Text>{change}</Text>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <Heading level={3} className="mb-2">Have suggestions?</Heading>
        <Text className="text-gray-600">
          We&apos;re always looking to improve PaletteCraft. If you have ideas for new features 
          or have found a bug, please reach out to us or check our roadmap for upcoming features.
        </Text>
      </div>
    </div>
  )
}
