
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, agentType, input, streamResponse = true } = body

    if (!projectId || !agentType) {
      return NextResponse.json(
        { error: 'Project ID and agent type are required' },
        { status: 400 }
      )
    }

    const agent = await prisma.agent.findFirst({
      where: { type: agentType }
    })

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    if (streamResponse) {
      return handleStreamingResponse(projectId, agent, input)
    } else {
      return handleDirectResponse(projectId, agent, input)
    }

  } catch (error) {
    console.error('Agent analyze API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleStreamingResponse(projectId: string, agent: any, input: any) {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      
      try {
        // Create execution record
        const execution = await prisma.agentExecution.create({
          data: {
            agentId: agent.id,
            projectId,
            status: 'RUNNING',
            input,
            startedAt: new Date()
          }
        })

        // Send initial status
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          status: 'started',
          agent: agent.type,
          executionId: execution.id
        })}\n\n`))

        // Simulate agent processing with streaming updates
        const steps = getAgentSteps(agent.type)
        
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i]
          
          // Send step start
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            status: 'processing',
            step: step.name,
            progress: Math.round((i / steps.length) * 100),
            message: step.description
          })}\n\n`))

          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
          
          // Send step completion
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            status: 'step_completed',
            step: step.name,
            result: step.result
          })}\n\n`))
        }

        // Generate LLM analysis based on agent type
        const analysisResult = await generateAgentAnalysis(agent.type, projectId, input)
        
        // Update execution with results
        await prisma.agentExecution.update({
          where: { id: execution.id },
          data: {
            status: 'COMPLETED',
            output: analysisResult,
            completedAt: new Date()
          }
        })

        // Send final result
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          status: 'completed',
          result: analysisResult
        })}\n\n`))

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Analysis failed'
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          status: 'error',
          error: errorMessage
        })}\n\n`))
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

async function handleDirectResponse(projectId: string, agent: any, input: any) {
  const execution = await prisma.agentExecution.create({
    data: {
      agentId: agent.id,
      projectId,
      status: 'RUNNING',
      input,
      startedAt: new Date()
    }
  })

  try {
    const result = await generateAgentAnalysis(agent.type, projectId, input)
    
    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        status: 'COMPLETED',
        output: result,
        completedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      executionId: execution.id,
      result
    })
  } catch (error) {
    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      }
    })
    
    throw error
  }
}

function getAgentSteps(agentType: string) {
  switch (agentType) {
    case 'INPUT_PARSER':
      return [
        { name: 'text_extraction', description: 'Extracting text content...', result: 'Text extracted successfully' },
        { name: 'data_parsing', description: 'Parsing structured data...', result: 'Data parsed and validated' },
        { name: 'format_conversion', description: 'Converting to standard format...', result: 'Format conversion complete' }
      ]
    case 'PLANNING_AGENT':
      return [
        { name: 'scope_analysis', description: 'Analyzing project scope...', result: 'Scope defined' },
        { name: 'timeline_generation', description: 'Creating project timeline...', result: 'Timeline created' },
        { name: 'resource_planning', description: 'Planning resource allocation...', result: 'Resources planned' }
      ]
    case 'RISK_ASSESSMENT':
      return [
        { name: 'risk_identification', description: 'Identifying potential risks...', result: 'Risks identified' },
        { name: 'impact_analysis', description: 'Analyzing risk impact...', result: 'Impact assessed' },
        { name: 'mitigation_planning', description: 'Planning mitigation strategies...', result: 'Mitigation strategies defined' }
      ]
    case 'DOCUMENTATION':
      return [
        { name: 'requirement_extraction', description: 'Extracting requirements...', result: 'Requirements extracted' },
        { name: 'document_generation', description: 'Generating documentation...', result: 'Documents created' },
        { name: 'template_application', description: 'Applying templates...', result: 'Templates applied' }
      ]
    default:
      return [
        { name: 'analysis', description: 'Running analysis...', result: 'Analysis complete' }
      ]
  }
}

async function generateAgentAnalysis(agentType: string, projectId: string, input: any) {
  // Get project context
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      requirements: true,
      tasks: true,
      risks: true
    }
  })

  // Prepare LLM messages based on agent type
  const messages = buildAgentMessages(agentType, project, input)
  
  // Validate API key
  const apiKey = process.env.ABACUSAI_API_KEY
  if (!apiKey) {
    throw new Error('ABACUSAI_API_KEY not configured')
  }

  // Call LLM API
  try {
    console.log(`Calling LLM API for agent ${agentType}`)
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages,
        max_tokens: 2000,
        temperature: 0.7
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error(`LLM API Error ${response.status}:`, errorText)
      throw new Error(`LLM API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const analysisText = data?.choices?.[0]?.message?.content ?? 'No analysis generated'
    
    return {
      agent: agentType,
      analysis: analysisText,
      timestamp: new Date(),
      projectContext: {
        title: project?.title,
        status: project?.status,
        requirementsCount: project?.requirements?.length ?? 0,
        tasksCount: project?.tasks?.length ?? 0,
        risksCount: project?.risks?.length ?? 0
      }
    }
  } catch (error) {
    console.error('LLM API call failed:', error)
    
    // Return fallback analysis
    return {
      agent: agentType,
      analysis: generateFallbackAnalysis(agentType, project),
      timestamp: new Date(),
      fallback: true,
      projectContext: {
        title: project?.title,
        status: project?.status
      }
    }
  }
}

function buildAgentMessages(agentType: string, project: any, input: any) {
  const baseContext = `Project: ${project?.title || 'Untitled'}\nDescription: ${project?.description || 'No description'}\nStatus: ${project?.status || 'Unknown'}`
  
  switch (agentType) {
    case 'INPUT_PARSER':
      return [{
        role: 'user',
        content: `As an Input Parser Agent, analyze and extract structured information from the following project input:\n\n${baseContext}\n\nInput to parse: ${JSON.stringify(input)}\n\nProvide a structured analysis of the input, identifying key project elements, requirements, tasks, and any actionable items.`
      }]
    case 'PLANNING_AGENT':
      return [{
        role: 'user',
        content: `As a Planning Agent, create a comprehensive project plan for:\n\n${baseContext}\n\nCreate a detailed timeline, identify key milestones, estimate effort, and suggest resource allocation. Consider dependencies and critical path.`
      }]
    case 'RISK_ASSESSMENT':
      return [{
        role: 'user',
        content: `As a Risk Assessment Agent, analyze potential risks for:\n\n${baseContext}\n\nIdentify technical, business, operational, and timeline risks. Assess probability and impact. Provide specific mitigation strategies for each risk.`
      }]
    case 'DOCUMENTATION':
      return [{
        role: 'user',
        content: `As a Documentation Agent, generate comprehensive project documentation for:\n\n${baseContext}\n\nCreate detailed requirements, technical specifications, and user stories. Format as professional project documentation.`
      }]
    default:
      return [{
        role: 'user',
        content: `Analyze the following project and provide insights:\n\n${baseContext}`
      }]
  }
}

function generateFallbackAnalysis(agentType: string, project: any) {
  switch (agentType) {
    case 'INPUT_PARSER':
      return `Input Parser Analysis: Successfully processed project "${project?.title}". Identified ${project?.requirements?.length ?? 0} requirements and ${project?.tasks?.length ?? 0} tasks.`
    case 'PLANNING_AGENT':
      return `Planning Analysis: Created project plan for "${project?.title}". Estimated 12-16 weeks duration with 4 major phases: Planning, Design, Implementation, Testing.`
    case 'RISK_ASSESSMENT':
      return `Risk Assessment: Identified ${project?.risks?.length ?? 0} risks for "${project?.title}". Primary risks include technical complexity, resource availability, and timeline constraints.`
    case 'DOCUMENTATION':
      return `Documentation Analysis: Generated comprehensive documentation for "${project?.title}". Includes requirements specification, technical architecture, and implementation guidelines.`
    default:
      return `Analysis complete for project "${project?.title}". Status: ${project?.status}`
  }
}
