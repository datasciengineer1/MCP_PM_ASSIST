
'use client'

import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Project {
  id: string
  title: string
  status: string
}

interface ProjectSelectorProps {
  selectedProject: string
  onProjectChange: (projectId: string) => void
}

export function ProjectSelector({ selectedProject, onProjectChange }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
        
        // If no project is selected but we have projects, select the first one
        if (!selectedProject && data?.length > 0) {
          onProjectChange(data?.[0]?.id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Loading projects..." />
        </SelectTrigger>
      </Select>
    )
  }

  if (projects?.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="No projects available" />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select value={selectedProject || undefined} onValueChange={onProjectChange}>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select a project" />
      </SelectTrigger>
      <SelectContent>
        {projects?.map((project) => (
          <SelectItem key={project?.id} value={project?.id ?? "fallback"}>
            {project?.title} ({project?.status})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
