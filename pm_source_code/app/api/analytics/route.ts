
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // For now, just get all data without project filtering
    const projectId = null;
    
    const whereClause = projectId && projectId !== 'all' ? { projectId } : {};
    
    // Fetch data for analytics
    const [projects, tasks, risks, requirements] = await Promise.all([
      prisma.project.findMany({
        where: projectId && projectId !== 'all' ? { id: projectId } : {},
      }),
      prisma.task.findMany({
        where: whereClause,
      }),
      prisma.risk.findMany({
        where: whereClause,
      }),
      prisma.requirement.findMany({
        where: whereClause,
      }),
    ]);

    // Process data for analytics
    const analytics = {
      projects: {
        total: projects.length,
        byStatus: projects.reduce((acc, project) => {
          acc[project.status] = (acc[project.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byType: projects.reduce((acc, project) => {
          acc[project.projectType] = (acc[project.projectType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
      tasks: {
        total: tasks.length,
        byStatus: tasks.reduce((acc, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byPriority: tasks.reduce((acc, task) => {
          acc[task.priority] = (acc[task.priority] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
      risks: {
        total: risks.length,
        byCategory: risks.reduce((acc, risk) => {
          acc[risk.category] = (acc[risk.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byLevel: risks.reduce((acc, risk) => {
          acc[risk.probability] = (acc[risk.probability] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
      requirements: {
        total: requirements.length,
        byCategory: requirements.reduce((acc, req) => {
          acc[req.category] = (acc[req.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byStatus: requirements.reduce((acc, req) => {
          acc[req.status] = (acc[req.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
