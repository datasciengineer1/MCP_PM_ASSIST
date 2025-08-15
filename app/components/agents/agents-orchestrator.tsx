
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings,
  FileSearch,
  Calendar,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Zap
} from 'lucide-react'
import { AgentExecutionView } from './agent-execution-view'
import { WorkflowPipeline } from './workflow-pipeline'
import { ProjectSelector } from './project-selector'
import { AgentSettingsDialog } from './agent-settings-dialog'
import { ClientDate } from '@/components/date-display'

interface Agent {
  id: string
  name: string
  type: string
  description?: string
  isActive: boolean
}

interface AgentsOrchestratorProps {
  projectId?: string
}

export function AgentsOrchestrator({ projectId }: AgentsOrchestratorProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedProject, setSelectedProject] = useState(projectId || '')
  const [isRunningWorkflow, setIsRunningWorkflow] = useState(false)
  const [workflowResults, setWorkflowResults] = useState<any>(null)
  const [executionLog, setExecutionLog] = useState<string[]>([])
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents')
      if (response.ok) {
        const fetchedAgents = await response.json()
        setAgents(fetchedAgents)
      } else {
        // Fallback to mock data if API fails
        const mockAgents = [
          { id: '1', name: 'Input Parser Agent', type: 'INPUT_PARSER', description: 'Processes and analyzes various input formats', isActive: true },
          { id: '2', name: 'Planning Agent', type: 'PLANNING_AGENT', description: 'Creates comprehensive project plans and timelines', isActive: true },
          { id: '3', name: 'Risk Assessment Agent', type: 'RISK_ASSESSMENT', description: 'Identifies and categorizes project risks', isActive: true },
          { id: '4', name: 'Documentation Agent', type: 'DOCUMENTATION', description: 'Generates structured requirements and documentation', isActive: true },
          { id: '5', name: 'Orchestrator Agent', type: 'ORCHESTRATOR', description: 'Coordinates workflows between agents', isActive: true }
        ]
        setAgents(mockAgents)
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error)
      // Set empty array to prevent duplicates
      setAgents([])
    }
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

  const runFullWorkflow = async () => {
    if (!selectedProject) {
      alert('Please select a project first')
      return
    }

    setIsRunningWorkflow(true)
    setWorkflowResults(null)
    setExecutionLog(['🚀 Starting multi-agent workflow...'])

    try {
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: selectedProject,
          workflow: 'full_analysis',
          input: {
            type: 'project_analysis',
            description: 'Running comprehensive AI analysis'
          }
        })
      })

      if (response.ok) {
        const results = await response.json()
        setWorkflowResults(results)
        setExecutionLog(prev => [...prev, '✅ Multi-agent workflow completed successfully'])
      } else {
        const error = await response.json()
        setExecutionLog(prev => [...prev, `❌ Workflow failed: ${error?.error || 'Unknown error'}`])
      }
    } catch (error) {
      console.error('Workflow execution error:', error)
      setExecutionLog(prev => [...prev, `❌ Workflow execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`])
    } finally {
      setIsRunningWorkflow(false)
    }
  }

  const runSingleAgent = async (agentType: string) => {
    if (!selectedProject) {
      alert('Please select a project first')
      return
    }

    // Add agent to running set
    setRunningAgents(prev => new Set([...prev, agentType]))
    setExecutionLog(prev => [...prev, `🔄 Starting ${agentType.replace('_', ' ').toLowerCase()}...`])

    try {
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: selectedProject,
          workflow: agentType.toLowerCase() + '_only',
          input: {
            type: 'single_agent_analysis',
            agentType,
            description: `Running individual ${agentType} analysis`
          }
        })
      })

      if (response.ok) {
        const results = await response.json()
        setExecutionLog(prev => [...prev, `✅ ${agentType.replace('_', ' ').toLowerCase()} completed successfully`])
        
        // Show detailed results for single agent runs
        if (results.workflow?.steps) {
          const agentStep = results.workflow.steps.find((s: any) => s.agent === agentType)
          if (agentStep?.result) {
            setExecutionLog(prev => [...prev, `📊 Results: ${JSON.stringify(agentStep.result).slice(0, 100)}...`])
          }
        }
      } else {
        const error = await response.json()
        setExecutionLog(prev => [...prev, `❌ ${agentType.replace('_', ' ').toLowerCase()} failed: ${error?.error || 'Unknown error'}`])
      }
    } catch (error) {
      console.error('Single agent execution error:', error)
      setExecutionLog(prev => [...prev, `❌ ${agentType.replace('_', ' ').toLowerCase()} failed: ${error instanceof Error ? error.message : 'Unknown error'}`])
    } finally {
      // Remove agent from running set
      setRunningAgents(prev => {
        const newSet = new Set(prev)
        newSet.delete(agentType)
        return newSet
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Multi-Agent System</h1>
          <p className="text-muted-foreground">
            Orchestrate AI agents for comprehensive program management analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ProjectSelector
            selectedProject={selectedProject}
            onProjectChange={setSelectedProject}
          />
          <Button 
            onClick={runFullWorkflow} 
            disabled={!selectedProject || isRunningWorkflow}
            size="lg"
          >
            {isRunningWorkflow ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                Running...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run Full Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Workflow Pipeline Visualization */}
      <WorkflowPipeline 
        isRunning={isRunningWorkflow}
        results={workflowResults}
      />

      {/* Agent Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents?.filter((agent, index, self) => 
          index === self.findIndex(a => a.type === agent.type)
        )?.map((agent) => {
          const Icon = getAgentIcon(agent?.type)
          const colorClass = getAgentColor(agent?.type)
          
          return (
            <Card key={agent?.id} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${colorClass} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {agent?.name?.replace(' Agent', '')}
                      </CardTitle>
                      <Badge variant={agent?.isActive ? "default" : "secondary"}>
                        {agent?.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {agent?.description}
                </p>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                    onClick={() => runSingleAgent(agent?.type)}
                    disabled={!selectedProject || runningAgents.has(agent?.type)}
                  >
                    {runningAgents.has(agent?.type) ? (
                      <>
                        <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full mr-1" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Run
                      </>
                    )}
                  </Button>
                  <AgentSettingsDialog agent={agent}>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="px-3"
                      title="Agent Settings"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </AgentSettingsDialog>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Type: {agent?.type}</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Ready
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Execution Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Execution Log
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExecutionLog([])}
              disabled={executionLog.length === 0}
            >
              Clear Log
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto">
            {executionLog?.length === 0 ? (
              <div className="text-muted-foreground italic">
                No executions yet. Select a project and run the analysis.
              </div>
            ) : (
              executionLog?.slice(-20).map((log, index) => (
                <div key={index} className="mb-1 flex items-start gap-2">
                  <span className="text-muted-foreground text-xs shrink-0 mt-0.5">
                    <ClientDate 
                      date={new Date()} 
                      format="datetime"
                    />
                  </span>
                  <span className="break-words">{log}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Results */}
      {workflowResults && (
        <AgentExecutionView results={workflowResults} />
      )}
    </div>
  )
}
