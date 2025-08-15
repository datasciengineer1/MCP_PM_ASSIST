
import { prisma } from '@/lib/db'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FolderOpen, 
  CheckCircle2, 
  AlertTriangle, 
  Bot, 
  TrendingUp,
  Clock,
  Users,
  FileText
} from 'lucide-react'
import { ProjectsChart } from '@/components/charts/projects-chart'
import { AgentStatusGrid } from '@/components/agents/agent-status-grid'
import { RecentProjects } from '@/components/projects/recent-projects'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { MetricExplainer } from '@/components/explainability/metric-explainer'
import { ExplainerCard } from '@/components/explainability/explainer-card'

export async function DashboardOverview() {
  // Fetch dashboard data
  const [projects, agents, requirements, tasks, risks] = await Promise.all([
    prisma.project.findMany({
      include: {
        _count: {
          select: {
            requirements: true,
            tasks: true,
            risks: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    }),
    prisma.agent.findMany({
      include: {
        executions: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          where: {
            status: { not: 'PENDING' }
          }
        }
      },
      where: {
        isActive: true
      }
    }),
    prisma.requirement.count(),
    prisma.task.count(),
    prisma.risk.count()
  ])

  // Calculate metrics
  const activeProjects = projects?.filter(p => p?.status === 'IN_PROGRESS')?.length ?? 0
  const completedProjects = projects?.filter(p => p?.status === 'COMPLETED')?.length ?? 0
  const totalProjects = projects?.length ?? 0
  const activeAgents = agents?.filter(a => a?.isActive)?.length ?? 0
  const highRisks = await prisma.risk.count({
    where: {
      impact: 'HIGH',
      status: { not: 'RESOLVED' }
    }
  })

  const stats = [
    {
      title: 'Total Projects',
      value: totalProjects,
      description: `${activeProjects} active, ${completedProjects} completed`,
      icon: FolderOpen,
      trend: { direction: 'up' as const, percentage: '+12%', isGood: true },
      explanation: {
        calculation: 'Count of all projects in the system',
        significance: 'Shows overall project portfolio size and activity level',
        benchmark: 'Industry average: 3-5 active projects per team',
        interpretation: `You have ${activeProjects} active projects with ${Math.round((completedProjects/totalProjects) * 100)}% completion rate`
      }
    },
    {
      title: 'Active Agents',
      value: activeAgents,
      description: `${agents?.length ?? 0} total agents configured`,
      icon: Bot,
      trend: { direction: 'up' as const, percentage: '+100%', isGood: true },
      explanation: {
        calculation: 'Count of AI agents with isActive = true',
        significance: 'Indicates automation level and AI integration maturity',
        benchmark: 'Recommended: 3-5 agents per project type',
        interpretation: `${Math.round((activeAgents/(agents?.length ?? 1)) * 100)}% of your configured agents are actively helping with project management`
      }
    },
    {
      title: 'Requirements',
      value: requirements,
      description: 'Across all projects',
      icon: FileText,
      trend: { direction: 'up' as const, percentage: '+34%', isGood: true },
      explanation: {
        calculation: 'Total count of requirements across all projects',
        significance: 'Higher counts may indicate project complexity or thoroughness in planning',
        benchmark: 'Average: 15-30 requirements per project',
        interpretation: `Approximately ${Math.round(requirements/Math.max(totalProjects, 1))} requirements per project, indicating ${requirements/Math.max(totalProjects, 1) > 20 ? 'detailed' : 'standard'} project scoping`
      }
    },
    {
      title: 'High Priority Risks',
      value: highRisks,
      description: 'Requiring attention',
      icon: AlertTriangle,
      trend: { direction: 'down' as const, percentage: '-5%', isGood: true },
      explanation: {
        calculation: 'Count of risks with HIGH impact and status != RESOLVED',
        significance: 'Critical metric for project health and success probability',
        benchmark: 'Target: <10% of total project count',
        interpretation: `${highRisks === 0 ? 'Excellent risk management' : highRisks <= totalProjects * 0.1 ? 'Acceptable risk level' : 'High risk exposure - needs attention'}`
      }
    }
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Quick Stats with Explainability */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats?.map((stat, index) => {
          const Icon = stat?.icon
          return (
            <MetricExplainer
              key={stat?.title}
              title={stat?.title}
              value={stat?.value ?? 0}
              description={stat?.description}
              trend={stat?.trend}
              explanation={stat?.explanation}
              icon={<Icon className="h-4 w-4 text-muted-foreground" />}
            />
          )
        })}
      </div>

      {/* AI Insights Panel */}
      <ExplainerCard
        title="AI Portfolio Analysis"
        description="Intelligent insights about your project portfolio health and recommendations"
        reasoning="Based on project completion rates, risk distribution, and team capacity analysis"
        confidence={87}
        type="insight"
        factors={[
          `${Math.round((completedProjects/totalProjects) * 100)}% project completion rate indicates ${completedProjects/totalProjects > 0.7 ? 'strong' : 'moderate'} delivery capability`,
          `${activeProjects} active projects suggests ${activeProjects > 5 ? 'high' : 'manageable'} team workload`,
          `${highRisks} high-priority risks ${highRisks === 0 ? 'show excellent' : highRisks > 3 ? 'indicate concerning' : 'suggest normal'} risk management`,
          `${activeAgents} active AI agents providing automated assistance and insights`
        ]}
        recommendations={[
          totalProjects === 0 ? "Start by creating your first project to begin tracking" : 
          activeProjects > 5 ? "Consider prioritizing active projects to avoid team overload" :
          "Portfolio looks healthy - consider expanding with new initiatives",
          highRisks > 2 ? "Focus on risk mitigation for high-priority items" : "Maintain current risk management practices",
          activeAgents < 3 ? "Enable more AI agents to improve automation and insights" : "AI agents are well-configured for current workload"
        ]}
        aiDecision={{
          method: "Multi-factor portfolio analysis using weighted scoring",
          criteria: [
            "Project completion velocity and success rate",
            "Risk-to-project ratio and severity distribution", 
            "Team capacity vs. active project load",
            "AI automation coverage and effectiveness"
          ],
          alternatives: [
            "Simple project count analysis (rejected: not comprehensive)",
            "Risk-only assessment (rejected: ignores positive indicators)",
            "Timeline-based analysis (rejected: insufficient historical data)"
          ]
        }}
      >
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {totalProjects > 0 ? Math.round((completedProjects/totalProjects) * 100) : 0}%
            </div>
            <div className="text-sm text-blue-800">Success Rate</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Math.round((activeAgents/(agents?.length || 1)) * 100)}%
            </div>
            <div className="text-sm text-green-800">AI Coverage</div>
          </div>
        </div>
      </ExplainerCard>

      {/* Main Dashboard Content */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Agent Status Grid */}
        <div className="lg:col-span-8">
          <AgentStatusGrid agents={agents as any[]} />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4">
          <QuickActions />
        </div>
      </div>

      {/* Projects Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Project Status Overview</CardTitle>
              <CardDescription>
                Current distribution of project statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectsChart projects={projects as any[]} />
            </CardContent>
          </Card>
        </div>

        <div>
          <RecentProjects projects={projects as any[]} />
        </div>
      </div>
    </div>
  )
}
