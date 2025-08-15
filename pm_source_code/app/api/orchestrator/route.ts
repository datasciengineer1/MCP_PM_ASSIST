
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, workflow = 'full_analysis', input } = body

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Find the orchestrator agent
    const orchestrator = await prisma.agent.findFirst({
      where: { type: 'ORCHESTRATOR' }
    })

    if (!orchestrator) {
      return NextResponse.json({ error: 'Orchestrator agent not found' }, { status: 404 })
    }

    // Create orchestrator execution
    const execution = await prisma.agentExecution.create({
      data: {
        agentId: orchestrator.id,
        projectId,
        status: 'RUNNING',
        input: { workflow, input },
        startedAt: new Date()
      }
    })

    // Start the multi-agent workflow
    const workflowResult = await executeWorkflow(projectId, workflow, input, execution.id)

    // Update execution with results
    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        status: workflowResult.success ? 'COMPLETED' : 'FAILED',
        output: workflowResult,
        completedAt: new Date(),
        errorMessage: workflowResult.success ? null : 'Workflow execution failed'
      }
    })

    return NextResponse.json({
      success: true,
      executionId: execution.id,
      workflow: workflowResult
    })

  } catch (error) {
    console.error('Orchestrator API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function executeWorkflow(
  projectId: string, 
  workflow: string, 
  input: any,
  executionId: string
) {
  try {
    const results = {
      success: true,
      workflow,
      projectId,
      executionId,
      steps: [] as any[],
      summary: {} as any
    }

    // Define workflow steps based on type
    const workflowSteps = getWorkflowSteps(workflow)
    
    for (const step of workflowSteps) {
      try {
        console.log(`Executing step: ${step.agent}`)
        const stepResult = await executeAgentStep(projectId, step, input)
        results.steps.push({
          agent: step.agent,
          status: 'completed',
          result: stepResult,
          timestamp: new Date()
        })
      } catch (stepError) {
        console.error(`Step ${step.agent} failed:`, stepError)
        results.steps.push({
          agent: step.agent,
          status: 'failed',
          error: stepError instanceof Error ? stepError.message : 'Unknown error',
          timestamp: new Date()
        })
      }
    }

    // Generate workflow summary
    results.summary = {
      totalSteps: workflowSteps.length,
      completedSteps: results.steps.filter(s => s.status === 'completed').length,
      failedSteps: results.steps.filter(s => s.status === 'failed').length,
      executionTime: new Date()
    }

    return results
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Workflow execution failed'
    }
  }
}

function getWorkflowSteps(workflow: string) {
  switch (workflow) {
    case 'full_analysis':
      return [
        { agent: 'INPUT_PARSER', priority: 1 },
        { agent: 'PLANNING_AGENT', priority: 2 },
        { agent: 'RISK_ASSESSMENT', priority: 3 },
        { agent: 'DOCUMENTATION', priority: 4 }
      ]
    case 'quick_parse':
      return [
        { agent: 'INPUT_PARSER', priority: 1 }
      ]
    case 'risk_only':
      return [
        { agent: 'INPUT_PARSER', priority: 1 },
        { agent: 'RISK_ASSESSMENT', priority: 2 }
      ]
    default:
      return [
        { agent: 'INPUT_PARSER', priority: 1 },
        { agent: 'PLANNING_AGENT', priority: 2 }
      ]
  }
}

async function executeAgentStep(projectId: string, step: any, input: any) {
  // Find the agent
  const agent = await prisma.agent.findFirst({
    where: { type: step.agent }
  })

  if (!agent) {
    throw new Error(`Agent ${step.agent} not found`)
  }

  // Create agent execution record
  const execution = await prisma.agentExecution.create({
    data: {
      agentId: agent.id,
      projectId,
      status: 'RUNNING',
      input,
      startedAt: new Date()
    }
  })

  // Execute agent-specific logic
  let result = {}
  
  try {
    switch (step.agent) {
      case 'INPUT_PARSER':
        result = await executeInputParser(projectId, input)
        break
      case 'PLANNING_AGENT':
        result = await executePlanningAgent(projectId, input)
        break
      case 'RISK_ASSESSMENT':
        result = await executeRiskAssessment(projectId, input)
        break
      case 'DOCUMENTATION':
        result = await executeDocumentation(projectId, input)
        break
      default:
        result = { message: `Agent ${step.agent} executed successfully` }
    }

    // Update execution with success
    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        status: 'COMPLETED',
        output: result,
        completedAt: new Date()
      }
    })

    return result
  } catch (error) {
    // Update execution with failure
    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        status: 'FAILED',
        errorMessage: (error instanceof Error ? error.message : 'Unknown error'),
        completedAt: new Date()
      }
    })
    throw error
  }
}

// Agent execution functions (simplified for MVP)
async function executeInputParser(projectId: string, input: any) {
  return {
    agent: 'INPUT_PARSER',
    processed: true,
    extractedData: {
      projectTitle: input?.title || 'Extracted Project',
      requirements: input?.requirements || [],
      tasks: input?.tasks || []
    }
  }
}

async function executePlanningAgent(projectId: string, input: any) {
  // Create some sample tasks for the project
  const sampleTasks = [
    { title: 'Project Initialization', estimatedHours: 8, priority: 'HIGH' as const },
    { title: 'Requirements Analysis', estimatedHours: 16, priority: 'HIGH' as const },
    { title: 'System Design', estimatedHours: 24, priority: 'MEDIUM' as const },
    { title: 'Implementation Phase 1', estimatedHours: 40, priority: 'MEDIUM' as const },
    { title: 'Testing & QA', estimatedHours: 16, priority: 'HIGH' as const }
  ]

  for (const taskData of sampleTasks) {
    await prisma.task.create({
      data: {
        ...taskData,
        projectId,
        description: `Auto-generated task: ${taskData.title}`,
        status: 'TODO',
        dependencies: '',
        tags: ''
      }
    })
  }

  return {
    agent: 'PLANNING_AGENT',
    tasksCreated: sampleTasks.length,
    timeline: '3-4 months',
    phases: ['Planning', 'Design', 'Development', 'Testing', 'Deployment']
  }
}

async function executeRiskAssessment(projectId: string, input: any) {
  // Create some sample risks
  const sampleRisks = [
    {
      title: 'Technical Complexity Risk',
      description: 'High technical complexity may lead to delays',
      category: 'TECHNICAL' as const,
      probability: 'MEDIUM' as const,
      impact: 'HIGH' as const
    },
    {
      title: 'Resource Availability',
      description: 'Key team members may not be available',
      category: 'RESOURCE' as const,
      probability: 'LOW' as const,
      impact: 'MEDIUM' as const
    }
  ]

  for (const riskData of sampleRisks) {
    await prisma.risk.create({
      data: {
        ...riskData,
        projectId,
        status: 'IDENTIFIED'
      }
    })
  }

  return {
    agent: 'RISK_ASSESSMENT',
    risksIdentified: sampleRisks.length,
    riskScore: 'Medium',
    recommendations: ['Conduct technical proof of concept', 'Establish resource backup plan']
  }
}

async function executeDocumentation(projectId: string, input: any) {
  // Create sample requirements
  const sampleRequirements = [
    {
      title: 'User Authentication',
      description: 'System must provide secure user authentication',
      category: 'FUNCTIONAL' as const,
      priority: 'HIGH' as const
    },
    {
      title: 'Data Security',
      description: 'All data must be encrypted in transit and at rest',
      category: 'NON_FUNCTIONAL' as const,
      priority: 'CRITICAL' as const
    }
  ]

  for (const reqData of sampleRequirements) {
    await prisma.requirement.create({
      data: {
        ...reqData,
        projectId,
        status: 'DRAFT',
        tags: ''
      }
    })
  }

  // Create project documentation
  await prisma.document.create({
    data: {
      projectId,
      title: 'Project Requirements Document',
      content: '# Project Requirements\n\nThis document outlines the key requirements for the project...',
      docType: 'REQUIREMENTS'
    }
  })

  return {
    agent: 'DOCUMENTATION',
    requirementsCreated: sampleRequirements.length,
    documentsGenerated: 1,
    documentTypes: ['requirements']
  }
}
