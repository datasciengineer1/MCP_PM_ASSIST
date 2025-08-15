
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { 
  Bot, 
  FileSearch, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'

interface Agent {
  id: string
  name: string
  type: string
  description?: string
  isActive: boolean
  executions: any[]
}

interface AgentStatusGridProps {
  agents: Agent[]
}

export function AgentStatusGrid({ agents }: AgentStatusGridProps) {
  const { toast } = useToast()

  const handleRunAgent = (agentId: string, agentName: string) => {
    toast({
      title: "Agent Started",
      description: `${agentName} has been triggered`,
    })
  }

  const handleResetAgent = (agentId: string, agentName: string) => {
    toast({
      title: "Agent Reset",
      description: `${agentName} has been reset to idle state`,
    })
  }
  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'INPUT_PARSER': return FileSearch
      case 'PLANNING_AGENT': return Calendar
      case 'RISK_ASSESSMENT': return AlertTriangle
      case 'DOCUMENTATION': return FileText
      case 'ORCHESTRATOR': return Settings
      default: return Bot
    }
  }

  const getAgentColor = (type: string) => {
    switch (type) {
      case 'INPUT_PARSER': return 'bg-blue-500'
      case 'PLANNING_AGENT': return 'bg-green-500'
      case 'RISK_ASSESSMENT': return 'bg-red-500'
      case 'DOCUMENTATION': return 'bg-purple-500'
      case 'ORCHESTRATOR': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getRecentExecutionStatus = (executions: any[]) => {
    if (!executions?.length) return 'idle'
    const recent = executions?.[0]
    return recent?.status?.toLowerCase() ?? 'idle'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-accent" />
          Multi-Agent System Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents?.filter((agent, index, self) => 
            index === self.findIndex(a => a.type === agent.type)
          )?.map((agent) => {
            const Icon = getAgentIcon(agent?.type)
            const colorClass = getAgentColor(agent?.type)
            const executionStatus = getRecentExecutionStatus(agent?.executions)
            const lastRun = agent?.executions?.[0]?.createdAt
            
            return (
              <Card key={`${agent?.id}-${agent?.type}`} className="relative card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${colorClass} text-white`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium">
                          {agent?.name?.replace(' Agent', '')}
                        </CardTitle>
                        <Badge 
                          variant={agent?.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {agent?.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    {agent?.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">Status</div>
                      <Badge 
                        variant={executionStatus === 'completed' ? "default" : 
                                executionStatus === 'running' ? "secondary" : 
                                executionStatus === 'failed' ? "destructive" : "outline"}
                        className="text-xs"
                      >
                        {executionStatus}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 w-7 p-0"
                        title="Run Agent"
                        onClick={() => handleRunAgent(agent?.id, agent?.name)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 w-7 p-0"
                        title="Reset Agent"
                        onClick={() => handleResetAgent(agent?.id, agent?.name)}
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-muted-foreground">Executions</div>
                    <span className="text-sm font-medium select-none pointer-events-none block" role="text" aria-readonly="true">
                      {agent?.executions?.length ?? 0} total
                    </span>
                  </div>
                  
                  {lastRun && (
                    <div>
                      <div className="text-xs text-muted-foreground">Last Run</div>
                      <div className="text-xs" suppressHydrationWarning>
                        {new Date(lastRun).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
