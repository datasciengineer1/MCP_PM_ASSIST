
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Settings,
  FileSearch,
  Calendar,
  AlertTriangle,
  FileText,
  Bot,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  Info,
  Zap,
  Database
} from 'lucide-react'

interface Agent {
  id: string
  name: string
  type: string
  description?: string
  isActive: boolean
}

interface AgentSettingsDialogProps {
  agent: Agent
  children: React.ReactNode
}

export function AgentSettingsDialog({ agent, children }: AgentSettingsDialogProps) {
  const [open, setOpen] = useState(false)

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

  const getAgentCapabilities = (type: string) => {
    switch (type) {
      case 'INPUT_PARSER':
        return [
          'Parse various file formats (PDF, DOCX, TXT)',
          'Extract structured data from documents',
          'Identify key requirements and constraints',
          'Convert unstructured text to structured format'
        ]
      case 'PLANNING_AGENT':
        return [
          'Generate comprehensive project plans',
          'Create work breakdown structures',
          'Estimate task durations and dependencies',
          'Optimize resource allocation'
        ]
      case 'RISK_ASSESSMENT':
        return [
          'Identify potential project risks',
          'Categorize risks by impact and probability',
          'Suggest mitigation strategies',
          'Monitor risk levels over time'
        ]
      case 'DOCUMENTATION':
        return [
          'Generate structured requirements documents',
          'Create technical specifications',
          'Maintain documentation consistency',
          'Auto-update documentation based on changes'
        ]
      case 'ORCHESTRATOR':
        return [
          'Coordinate multi-agent workflows',
          'Manage agent execution sequences',
          'Handle inter-agent communication',
          'Monitor overall system performance'
        ]
      default:
        return ['General AI agent capabilities']
    }
  }

  const getAgentMetrics = () => {
    // Mock data - in real app, this would come from database
    return {
      totalExecutions: Math.floor(Math.random() * 50) + 10,
      successRate: Math.floor(Math.random() * 20) + 80,
      avgExecutionTime: Math.floor(Math.random() * 30) + 15,
      lastExecution: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toLocaleDateString(),
      status: agent.isActive ? 'Active' : 'Inactive'
    }
  }

  const Icon = getAgentIcon(agent.type)
  const colorClass = getAgentColor(agent.type)
  const capabilities = getAgentCapabilities(agent.type)
  const metrics = getAgentMetrics()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${colorClass} text-white`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl">
                {agent.name}
              </DialogTitle>
              <DialogDescription className="text-base">
                {agent.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="configuration">Settings</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[450px] mt-4">
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Info className="h-5 w-5" />
                      Agent Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Type:</span>
                      <Badge variant="outline">{agent.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant={agent.isActive ? "default" : "secondary"}>
                        {agent.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Agent ID:</span>
                      <span className="text-sm text-muted-foreground font-mono">{agent.id}</span>
                    </div>
                    <Separator />
                    <div>
                      <span className="text-sm font-medium">Description:</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {agent.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="h-5 w-5" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total Runs:</span>
                      <span className="text-sm font-mono">{metrics.totalExecutions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Success Rate:</span>
                      <span className="text-sm font-mono">{metrics.successRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Avg Runtime:</span>
                      <span className="text-sm font-mono">{metrics.avgExecutionTime}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Last Run:</span>
                      <span className="text-sm text-muted-foreground" suppressHydrationWarning>
                        {metrics.lastExecution}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="capabilities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Agent Capabilities
                  </CardTitle>
                  <CardDescription>
                    What this agent can do for your projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {capabilities.map((capability, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">{capability}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Success Rate</span>
                        <span>{metrics.successRate}%</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all" 
                          style={{ width: `${metrics.successRate}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Efficiency</span>
                        <span>85%</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full">
                        <div className="bg-blue-500 h-2 rounded-full transition-all w-[85%]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Execution History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Completed - 2 hours ago</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Completed - 1 day ago</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Running - 3 days ago</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Failed - 5 days ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="configuration" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Agent Configuration
                  </CardTitle>
                  <CardDescription>
                    Customize agent behavior and parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Execution Timeout</label>
                      <div className="text-sm text-muted-foreground">300 seconds</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Max Retries</label>
                      <div className="text-sm text-muted-foreground">3 attempts</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Priority Level</label>
                      <div className="text-sm text-muted-foreground">Normal</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Auto-restart</label>
                      <div className="text-sm text-muted-foreground">Enabled</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium">Environment Variables</label>
                    <div className="text-sm text-muted-foreground mt-1">
                      <div>API_ENDPOINT: https://api.example.com</div>
                      <div>LOG_LEVEL: INFO</div>
                      <div>MAX_WORKERS: 4</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
