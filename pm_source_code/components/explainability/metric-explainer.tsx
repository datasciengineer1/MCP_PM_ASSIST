
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Info,
  BarChart3,
  Target
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MetricExplainerProps {
  title: string;
  value: number | string;
  description: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: string;
    isGood: boolean;
  };
  explanation: {
    calculation: string;
    significance: string;
    benchmark?: string;
    interpretation: string;
  };
  icon?: React.ReactNode;
}

export function MetricExplainer({
  title,
  value,
  description,
  trend,
  explanation,
  icon
}: MetricExplainerProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    const iconClass = `h-3 w-3 mr-1 ${trend.isGood ? 'text-green-500' : 'text-red-500'}`;
    
    switch (trend.direction) {
      case 'up': return <TrendingUp className={iconClass} />;
      case 'down': return <TrendingDown className={iconClass} />;
      default: return <Activity className={iconClass} />;
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon || <BarChart3 className="h-4 w-4 text-muted-foreground" />}
          {title}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2">
                  <p><strong>How it's calculated:</strong></p>
                  <p className="text-sm">{explanation.calculation}</p>
                  <p><strong>What it means:</strong></p>
                  <p className="text-sm">{explanation.significance}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
        {trend && (
          <div className="flex items-center pt-1">
            {getTrendIcon()}
            <span className={`text-xs font-medium ${trend.isGood ? 'text-green-600' : 'text-red-600'}`}>
              {trend.percentage}
            </span>
          </div>
        )}
        
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <h4 className="text-xs font-semibold flex items-center gap-1">
            <Target className="w-3 h-3" />
            Interpretation:
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {explanation.interpretation}
          </p>
          {explanation.benchmark && (
            <p className="text-xs text-muted-foreground mt-1">
              <strong>Benchmark:</strong> {explanation.benchmark}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
