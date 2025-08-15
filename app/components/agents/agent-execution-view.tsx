
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Bot,
  FileSearch,
  Calendar,
  AlertTriangle,
  FileText,
  Settings
} from 'lucide-react'
import { ClientDate } from '@/components/date-display'

interface WorkflowResults {
  success: boolean
  workflow: string
  projectId: string
  executionId: string
  steps: Array<{
    agent: string
    status: string
    result?: any
    error?: string
    timestamp: string
  }>
  summary: {
    totalSteps: number
    completedSteps: number
    failedSteps: number
    executionTime: string
  }
}

interface AgentExecutionViewProps {
  results: WorkflowResults
}

export function AgentExecutionView({ results }: AgentExecutionViewProps) {
  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case 'INPUT_PARSER': return FileSearch
      case 'PLANNING_AGENT': return Calendar
      case 'RISK_ASSESSMENT': return AlertTriangle
      case 'DOCUMENTATION': return FileText
      case 'ORCHESTRATOR': return Settings
      default: return Bot
    }
  }

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'INPUT_PARSER': return 'bg-blue-500'
      case 'PLANNING_AGENT': return 'bg-green-500'
      case 'RISK_ASSESSMENT': return 'bg-red-500'
      case 'DOCUMENTATION': return 'bg-purple-500'
      case 'ORCHESTRATOR': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const formatAgentName = (agent: string) => {
    return agent?.replace('_', ' ')?.toLowerCase()
      ?.split(' ')
      ?.map(word => word?.charAt(0)?.toUpperCase() + word?.slice(1))
      ?.join(' ') ?? agent
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Execution Results
          </CardTitle>
          <Badge variant={results?.success ? "default" : "destructive"}>
            {results?.success ? "Success" : "Failed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">{results?.summary?.totalSteps ?? 0}</div>
            <div className="text-sm text-muted-foreground">Total Steps</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{results?.summary?.completedSteps ?? 0}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{results?.summary?.failedSteps ?? 0}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">
              <ClientDate 
                date={results?.summary?.executionTime ?? new Date()} 
                format="datetime"
              />
            </div>
            <div className="text-sm text-muted-foreground">Completed At</div>
          </div>
        </div>

        {/* Agent Results */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Agent Execution Details</h3>
          {results?.steps?.map((step, index) => {
            const Icon = getAgentIcon(step?.agent)
            const colorClass = getAgentColor(step?.agent)
            const isSuccess = step?.status === 'completed'
            
            return (
              <Card key={`${step?.agent}-${index}`} className="border-l-4" style={{
                borderLeftColor: isSuccess ? '#22c55e' : '#ef4444'
              }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${colorClass} text-white`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{formatAgentName(step?.agent)}</h4>
                        <p className="text-sm text-muted-foreground">
                          <ClientDate 
                            date={step?.timestamp} 
                            format="datetime"
                          />
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSuccess ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <Badge variant={isSuccess ? "default" : "destructive"}>
                        {step?.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isSuccess && step?.result ? (
                    <div className="space-y-2">
                      {typeof step?.result === 'object' ? (
                        Object?.entries(step?.result)?.map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-medium capitalize">
                              {key?.replace(/([A-Z])/g, ' $1')?.trim()}:
                            </span>
                            <span className="text-muted-foreground">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm">{String(step?.result)}</p>
                      )}
                    </div>
                  ) : (
                    step?.error && (
                      <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                        <strong>Error:</strong> {step?.error}
                      </div>
                    )
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
