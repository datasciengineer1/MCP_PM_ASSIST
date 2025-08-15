
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        requirements: {
          orderBy: { createdAt: 'desc' }
        },
        tasks: {
          orderBy: { createdAt: 'desc' }
        },
        risks: {
          orderBy: { createdAt: 'desc' }
        },
        documents: {
          orderBy: { createdAt: 'desc' }
        },
        agentExecutions: {
          include: {
            agent: true
          },
          orderBy: { createdAt: 'desc' }
        },
        uploads: {
          orderBy: { uploadedAt: 'desc' }
        },
        _count: {
          select: {
            requirements: true,
            tasks: true,
            risks: true,
            documents: true,
            agentExecutions: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Project GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    const body = await request.json()

    const {
      title,
      description,
      status,
      priority,
      industry,
      estimatedDuration,
      startDate,
      endDate
    } = body

    const updateData: any = {}
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (industry !== undefined) updateData.industry = industry
    if (estimatedDuration !== undefined) updateData.estimatedDuration = estimatedDuration
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null

    const project = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        requirements: true,
        tasks: true,
        risks: true,
        documents: true,
        _count: {
          select: {
            requirements: true,
            tasks: true,
            risks: true,
            documents: true
          }
        }
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Project PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id

    await prisma.project.delete({
      where: { id: projectId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Project DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
