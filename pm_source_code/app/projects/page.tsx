
import { Suspense } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { ProjectsList } from '@/components/projects/projects-list'

export const dynamic = 'force-dynamic'

export default function ProjectsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="hidden lg:block" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Projects" 
          subtitle="Manage and monitor your projects with AI-powered insights"
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-pulse-custom text-muted-foreground">
                  Loading projects...
                </div>
              </div>
            }>
              <ProjectsList />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
