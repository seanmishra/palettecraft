import { Heading } from '@/app/components/catalyst-ui-kit/heading'
import { Text } from '@/app/components/catalyst-ui-kit/text'
import { Badge } from '@/app/components/catalyst-ui-kit/badge'

const roadmapItems = [
  {
    title: 'Advanced Color Harmonies',
    description: 'Generate complementary, triadic, and analogous color schemes automatically',
    status: 'planned',
    quarter: 'Q2 2025',
    priority: 'high',
  },
  {
    title: 'Color Accessibility Checker',
    description: 'Built-in WCAG contrast ratio checker and accessibility recommendations',
    status: 'planned',
    quarter: 'Q2 2025',
    priority: 'high',
  },
  {
    title: 'AI-Powered Color Suggestions',
    description: 'Machine learning-based color recommendations based on design trends',
    status: 'planned',
    quarter: 'Q3 2025',
    priority: 'medium',
  },
  {
    title: 'Team Collaboration',
    description: 'Share palettes with team members and collaborate on color schemes',
    status: 'in-progress',
    quarter: 'Q2 2025',
    priority: 'medium',
  },
  {
    title: 'Export to Design Tools',
    description: 'Direct export to Figma, Adobe Creative Suite, and Sketch',
    status: 'planned',
    quarter: 'Q3 2025',
    priority: 'medium',
  },
  {
    title: 'Gradient Generator',
    description: 'Create beautiful gradients from extracted color palettes',
    status: 'planned',
    quarter: 'Q3 2025',
    priority: 'low',
  },
  {
    title: 'Color Palette Templates',
    description: 'Pre-built palette templates for common design use cases',
    status: 'planned',
    quarter: 'Q4 2025',
    priority: 'low',
  },
  {
    title: 'Mobile App',
    description: 'Native iOS and Android apps for on-the-go palette creation',
    status: 'planned',
    quarter: 'Q4 2025',
    priority: 'low',
  },
  {
    title: 'API Access',
    description: 'RESTful API for developers to integrate PaletteCraft into their workflows',
    status: 'planned',
    quarter: 'Q4 2025',
    priority: 'medium',
  },
]

export default function RoadmapPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge color="green">Completed</Badge>
      case 'in-progress':
        return <Badge color="blue">In Progress</Badge>
      case 'planned':
        return <Badge color="zinc">Planned</Badge>
      default:
        return <Badge color="zinc">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge color="red">High Priority</Badge>
      case 'medium':
        return <Badge color="orange">Medium Priority</Badge>
      case 'low':
        return <Badge color="zinc">Low Priority</Badge>
      default:
        return <Badge color="zinc">Unknown</Badge>
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <Heading level={1}>Roadmap</Heading>
        <Text>See what&apos;s coming next to PaletteCraft. Our roadmap is updated regularly based on user feedback and market needs.</Text>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Badge color="green">Completed</Badge>
            <Text className="text-sm text-gray-600">Feature is live</Text>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="blue">In Progress</Badge>
            <Text className="text-sm text-gray-600">Currently being developed</Text>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="zinc">Planned</Badge>
            <Text className="text-sm text-gray-600">In our backlog</Text>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {roadmapItems.map((item, index) => (
          <div key={index} className="border rounded-lg p-6 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Heading level={3} className="text-lg mb-2">{item.title}</Heading>
                <Text className="text-gray-600 mb-3">{item.description}</Text>
                
                <div className="flex flex-wrap items-center gap-3">
                  {getStatusBadge(item.status)}
                  {getPriorityBadge(item.priority)}
                  <Text className="text-sm text-gray-500">Target: {item.quarter}</Text>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-blue-50 rounded-lg">
        <Heading level={3} className="mb-2">Want to influence our roadmap?</Heading>
        <Text className="text-gray-600 mb-4">
          Your feedback helps us prioritize features. If there&apos;s something you&apos;d love to see 
          in PaletteCraft, let us know!
        </Text>
        <div className="space-y-2">
          <Text className="text-sm">
            <strong>Feature requests:</strong> Submit ideas for new functionality
          </Text>
          <Text className="text-sm">
            <strong>Bug reports:</strong> Help us improve existing features
          </Text>
          <Text className="text-sm">
            <strong>Priority voting:</strong> Vote on which features matter most to you
          </Text>
        </div>
      </div>
    </div>
  )
}
