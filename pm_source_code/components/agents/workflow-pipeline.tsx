
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileSearch,
  Calendar,
  AlertTriangle,
  FileText
} from 'lucide-react'

interface WorkflowStep {
  agent: string
  status: string
  result?: any
  timestamp?: string
  error?: string
}

interface WorkflowPipelineProps {
  isRunning: boolean
  results?: {
    steps: WorkflowStep[]
    summary?: any
  }
}

export function WorkflowPipeline({ isRunning, results }: WorkflowPipelineProps) {
  const getStepIcon = (agent: string) => {
    switch (agent) {
      case 'INPUT_PARSER': return FileSearch
      case 'PLANNING_AGENT': return Calendar
      case 'RISK_ASSESSMENT': return AlertTriangle
      case 'DOCUMENTATION': return FileText
      default: return Clock
    }
  }

  const getStepStatus = (step: WorkflowStep, index: number) => {
    if (!isRunning && !results) return 'pending'
    if (isRunning) {
      if (index === 0) return 'running'
      return 'pending'
    }
    return step?.status ?? 'pending'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500'
      case 'failed': return 'text-red-500'
      case 'running': return 'text-blue-500'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle2
      case 'failed': return XCircle
      case 'running': return Clock
      default: return Clock
    }
  }

  // Define standard workflow steps
  const workflowSteps = [
    { agent: 'INPUT_PARSER', name: 'Input Analysis', description: 'Process and parse input data' },
    { agent: 'PLANNING_AGENT', name: 'Project Planning', description: 'Generate timeline and tasks' },
    { agent: 'RISK_ASSESSMENT', name: 'Risk Analysis', description: 'Identify and assess risks' },
    { agent: 'DOCUMENTATION', name: 'Documentation', description: 'Generate requirements and specs' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          {workflowSteps?.map((step, index) => {
            const Icon = getStepIcon(step?.agent)
            const resultStep = results?.steps?.find(s => s?.agent === step?.agent)
            const status = getStepStatus(resultStep!, index)
            const StatusIcon = getStatusIcon(status)
            const statusColor = getStatusColor(status)
            
            return (
              <div key={step?.agent} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`relative p-3 rounded-full border-2 ${
                    status === 'completed' ? 'border-green-500 bg-green-50' :
                    status === 'failed' ? 'border-red-500 bg-red-50' :
                    status === 'running' ? 'border-blue-500 bg-blue-50' :
                    'border-gray-300 bg-gray-50'
                  }`}>
                    <Icon className={`h-5 w-5 ${statusColor}`} />
                    {status === 'running' && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium">{step?.name}</div>
                    <div className="text-xs text-muted-foreground max-w-24 line-clamp-2">
                      {step?.description}
                    </div>
                    <div className={`flex items-center justify-center gap-1 mt-1 ${statusColor}`}>
                      <StatusIcon className="h-3 w-3" />
                      <span className="text-xs capitalize">{status}</span>
                    </div>
                  </div>
                </div>
                
                {index < workflowSteps?.length - 1 && (
                  <ArrowRight className="mx-4 h-5 w-5 text-gray-400" />
                )}
              </div>
            )
          })}
        </div>

        {/* Workflow Summary */}
        {results?.summary && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span>Total Steps: {results?.summary?.totalSteps ?? 0}</span>
                <span className="text-green-600">
                  Completed: {results?.summary?.completedSteps ?? 0}
                </span>
                {(results?.summary?.failedSteps ?? 0) > 0 && (
                  <span className="text-red-600">
                    Failed: {results?.summary?.failedSteps}
                  </span>
                )}
              </div>
              <Badge variant={
                (results?.summary?.failedSteps ?? 0) > 0 ? "destructive" : 
                (results?.summary?.completedSteps ?? 0) === (results?.summary?.totalSteps ?? 0) ? "default" : 
                "secondary"
              }>
                {(results?.summary?.failedSteps ?? 0) > 0 ? "Failed" :
                 (results?.summary?.completedSteps ?? 0) === (results?.summary?.totalSteps ?? 0) ? "Completed" :
                 "In Progress"}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
