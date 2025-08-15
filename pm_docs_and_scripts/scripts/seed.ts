
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create test user
  const hashedPassword = await bcrypt.hash('johndoe123', 12)
  
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'John Doe',
      password: hashedPassword
    }
  })

  console.log('Test user created: john@doe.com')

  // Create the five core agents
  const agents = [
    {
      name: 'Input Parser Agent',
      type: 'INPUT_PARSER' as const,
      description: 'Processes and analyzes various input formats including text descriptions, Excel files, and JIRA exports',
      config: {
        supportedFormats: ['text', 'xlsx', 'csv', 'json'],
        maxFileSize: 50 * 1024 * 1024, // 50MB
        capabilities: ['text_extraction', 'data_parsing', 'format_conversion']
      }
    },
    {
      name: 'Planning Agent',
      type: 'PLANNING_AGENT' as const,
      description: 'Creates comprehensive project plans, timelines, and milestone definitions',
      config: {
        planningMethods: ['agile', 'waterfall', 'hybrid'],
        timelineGeneration: true,
        milestoneTracking: true,
        resourceAllocation: true
      }
    },
    {
      name: 'Risk Assessment Agent',
      type: 'RISK_ASSESSMENT' as const,
      description: 'Identifies, categorizes, and provides mitigation strategies for project risks',
      config: {
        riskCategories: ['technical', 'business', 'operational', 'financial', 'timeline', 'resource'],
        assessmentFramework: 'probability_impact_matrix',
        mitigationStrategies: true
      }
    },
    {
      name: 'Documentation Agent',
      type: 'DOCUMENTATION' as const,
      description: 'Generates structured requirements, technical specifications, and project documentation',
      config: {
        documentTypes: ['requirements', 'technical_spec', 'user_stories', 'api_docs'],
        formats: ['markdown', 'html', 'pdf'],
        templates: ['agile', 'traditional', 'api_first']
      }
    },
    {
      name: 'Orchestrator Agent',
      type: 'ORCHESTRATOR' as const,
      description: 'Coordinates workflows between agents, manages execution state, and ensures proper sequencing',
      config: {
        workflowEngine: true,
        stateManagement: true,
        errorRecovery: true,
        parallelExecution: true
      }
    }
  ]

  console.log('Creating agents...')
  for (const agent of agents) {
    await prisma.agent.upsert({
      where: { name: agent.name },
      update: agent,
      create: agent
    })
    console.log(`✓ Created/updated agent: ${agent.name}`)
  }

  // Create sample project templates for different industries
  const sampleProjects = [
    {
      title: 'E-Commerce Platform Development',
      description: 'Build a modern e-commerce platform with React, Node.js, and PostgreSQL',
      industry: 'Software Development',
      projectType: 'SOFTWARE' as const,
      priority: 'HIGH' as const,
      estimatedDuration: 120,
    },
    {
      title: 'Marketing Campaign Launch',
      description: 'Launch a multi-channel marketing campaign for new product introduction',
      industry: 'Marketing',
      projectType: 'MARKETING' as const,
      priority: 'MEDIUM' as const,
      estimatedDuration: 45,
    },
    {
      title: 'Cloud Infrastructure Migration',
      description: 'Migrate legacy systems to AWS cloud infrastructure with zero downtime',
      industry: 'IT Infrastructure',
      projectType: 'INFRASTRUCTURE' as const,
      priority: 'CRITICAL' as const,
      estimatedDuration: 90,
    }
  ]

  console.log('Creating sample projects...')
  for (const project of sampleProjects) {
    const created = await prisma.project.create({
      data: project
    })
    console.log(`✓ Created sample project: ${created.title}`)
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
