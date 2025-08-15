
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Upload, 
  FileText, 
  Bot, 
  Zap,
  ArrowRight 
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickActions() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const actions = [
    {
      id: 'new-project',
      title: 'New Project',
      description: 'Start a new project with AI assistance',
      icon: Plus,
      color: 'bg-blue-500',
      href: '/projects/new'
    },
    {
      id: 'upload-files',
      title: 'Upload Files',
      description: 'Process Excel, JIRA, or text files',
      icon: Upload,
      color: 'bg-green-500',
      href: '/upload'
    },
    {
      id: 'generate-docs',
      title: 'Generate Docs',
      description: 'Create requirements & specifications',
      icon: FileText,
      color: 'bg-purple-500',
      href: '/documents/generate'
    },
    {
      id: 'run-agents',
      title: 'Run Multi-Agent Analysis',
      description: 'Execute the complete agent pipeline',
      icon: Bot,
      color: 'bg-orange-500',
      action: () => handleRunAgents()
    }
  ]

  const handleRunAgents = async () => {
    setIsLoading('run-agents')
    // This will be implemented when we create the agent orchestration
    setTimeout(() => {
      setIsLoading(null)
      router.push('/agents')
    }, 2000)
  }

  const handleAction = (action: any) => {
    if (action?.action) {
      action.action()
    } else if (action?.href) {
      router.push(action.href)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions?.map((action) => {
          const Icon = action?.icon
          const isActionLoading = isLoading === action?.id
          
          return (
            <Button
              key={action?.id}
              variant="ghost"
              className="w-full justify-start h-auto p-4 text-left"
              onClick={() => handleAction(action)}
              disabled={isActionLoading}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`p-2 rounded-lg ${action?.color} text-white`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{action?.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {action?.description}
                  </div>
                </div>
                {isActionLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
