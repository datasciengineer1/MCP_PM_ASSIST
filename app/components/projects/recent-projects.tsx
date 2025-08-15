
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ClientDate } from '@/components/date-display'
import { 
  FolderOpen, 
  Calendar, 
  AlertTriangle, 
  Users,
  ArrowRight,
  FileText
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Project {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  industry?: string
  updatedAt: string
  _count?: {
    requirements: number
    tasks: number
    risks: number
  }
}

interface RecentProjectsProps {
  projects: Project[]
}

export function RecentProjects({ projects }: RecentProjectsProps) {
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'default'
      case 'IN_PROGRESS': return 'secondary'
      case 'ON_HOLD': return 'outline'
      case 'CANCELLED': return 'destructive'
      default: return 'outline'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-500'
      case 'HIGH': return 'text-orange-500'
      case 'MEDIUM': return 'text-yellow-500'
      default: return 'text-green-500'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-accent" />
            Recent Projects
          </span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/projects')}
          >
            View All
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No projects yet</p>
            <p className="text-xs">Create your first project to get started</p>
          </div>
        ) : (
          projects?.map((project) => (
            <div 
              key={project?.id}
              className="border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => router.push(`/projects/${project?.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">{project?.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {project?.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <AlertTriangle 
                    className={`h-3 w-3 ${getPriorityColor(project?.priority)}`} 
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(project?.status)} className="text-xs">
                    {project?.status?.replace('_', ' ')}
                  </Badge>
                  {project?.industry && (
                    <span className="text-xs text-muted-foreground">
                      {project?.industry}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground" role="group" aria-label="Project statistics">
                  <div className="flex items-center gap-1" role="status">
                    <FileText className="h-3 w-3" />
                    <span className="text-xs select-none pointer-events-none" role="text" aria-readonly="true">{project?._count?.requirements ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-1" role="status">
                    <Users className="h-3 w-3" />
                    <span className="text-xs select-none pointer-events-none" role="text" aria-readonly="true">{project?._count?.tasks ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-1" role="status">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="text-xs select-none pointer-events-none" role="text" aria-readonly="true">{project?._count?.risks ?? 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Updated <ClientDate date={project?.updatedAt} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
