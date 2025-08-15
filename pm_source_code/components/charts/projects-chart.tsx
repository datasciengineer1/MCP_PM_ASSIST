
'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface Project {
  id: string
  title: string
  status: string
  priority: string
}

interface ProjectsChartProps {
  projects: Project[]
}

export function ProjectsChart({ projects }: ProjectsChartProps) {
  const statusColors = {
    'PLANNING': '#60B5FF',
    'IN_PROGRESS': '#FF9149', 
    'ON_HOLD': '#FF9898',
    'COMPLETED': '#72BF78',
    'CANCELLED': '#FF6363'
  }

  const statusCounts = projects?.reduce((acc, project) => {
    const status = project?.status ?? 'PLANNING'
    acc[status] = (acc[status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>) ?? {}

  const chartData = Object?.entries(statusCounts)?.map(([status, count]) => ({
    name: status?.replace('_', ' '),
    value: count,
    color: statusColors[status as keyof typeof statusColors] ?? '#60B5FF'
  })) ?? []

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.[0]) {
      return (
        <div className="bg-background border rounded-lg p-2 shadow-lg">
          <p className="text-sm font-medium">
            {payload?.[0]?.name}: {payload?.[0]?.value} projects
          </p>
        </div>
      )
    }
    return null
  }

  if (chartData?.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No projects data available
      </div>
    )
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}`}
          >
            {chartData?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry?.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top"
            wrapperStyle={{ fontSize: 11 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
