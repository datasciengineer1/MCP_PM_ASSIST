
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  FolderOpen, 
  Calendar, 
  AlertTriangle, 
  Users,
  FileText,
  Bot,
  MoreHorizontal
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CreateProjectDialog } from './create-project-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Project {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  industry?: string
  updatedAt: string
  _count: {
    requirements: number
    tasks: number
    risks: number
    documents: number
  }
}

export function ProjectsList() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

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

  const runMultiAgentAnalysis = async (projectId: string) => {
    try {
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          workflow: 'full_analysis'
        })
      })

      if (response.ok) {
        router.push(`/agents?projectId=${projectId}`)
      }
    } catch (error) {
      console.error('Failed to run analysis:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-custom text-muted-foreground">
          Loading projects...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects with AI-powered program management
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {projects?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first project. Our AI agents will help you with planning, requirements, and risk assessment.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project) => (
            <Card key={project?.id} className="card-hover cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{project?.title}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project?.description || 'No description'}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => router.push(`/projects/${project?.id}`)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => runMultiAgentAnalysis(project?.id)}>
                        <Bot className="h-4 w-4 mr-2" />
                        Run AI Analysis
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={getStatusColor(project?.status)} className="text-xs">
                    {project?.status?.replace('_', ' ')}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <AlertTriangle 
                      className={`h-3 w-3 ${getPriorityColor(project?.priority)}`} 
                    />
                    <span className="text-xs text-muted-foreground">
                      {project?.priority}
                    </span>
                  </div>
                </div>

                {project?.industry && (
                  <div className="text-xs text-muted-foreground">
                    Industry: {project?.industry}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs" role="group" aria-label="Project statistics">
                  <div className="flex items-center gap-1 text-muted-foreground" role="status">
                    <FileText className="h-3 w-3" />
                    <span className="text-sm select-none pointer-events-none" role="text" aria-readonly="true">{project?._count?.requirements ?? 0} Requirements</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground" role="status">
                    <Users className="h-3 w-3" />
                    <span className="text-sm select-none pointer-events-none" role="text" aria-readonly="true">{project?._count?.tasks ?? 0} Tasks</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground" role="status">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="text-sm select-none pointer-events-none" role="text" aria-readonly="true">{project?._count?.risks ?? 0} Risks</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground" role="status">
                    <FileText className="h-3 w-3" />
                    <span className="text-sm select-none pointer-events-none" role="text" aria-readonly="true">{project?._count?.documents ?? 0} Docs</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => router.push(`/projects/${project?.id}`)}
                  >
                    <FolderOpen className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => runMultiAgentAnalysis(project?.id)}
                  >
                    <Bot className="h-3 w-3 mr-1" />
                    Analyze
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground pt-2 border-t" suppressHydrationWarning>
                  Updated {new Date(project?.updatedAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onProjectCreated={fetchProjects}
      />
    </div>
  )
}
