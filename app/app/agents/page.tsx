
import { Suspense } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { AgentsOrchestrator } from '@/components/agents/agents-orchestrator'

export const dynamic = 'force-dynamic'

interface SearchParams {
  projectId?: string
}

export default function AgentsPage({
  searchParams
}: {
  searchParams: SearchParams
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="hidden lg:block" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Multi-Agent System" 
          subtitle="AI-powered program management agents working together"
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-pulse-custom text-muted-foreground">
                  Loading agents...
                </div>
              </div>
            }>
              <AgentsOrchestrator projectId={searchParams?.projectId} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
