
'use client'

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  XCircle 
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConfidenceIndicatorProps {
  confidence: number;
  explanation: string;
  factors?: {
    name: string;
    weight: number;
    impact: 'positive' | 'negative' | 'neutral';
  }[];
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceIndicator({
  confidence,
  explanation,
  factors = [],
  showProgress = false,
  size = 'md'
}: ConfidenceIndicatorProps) {
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 90) return { label: 'Very High', color: 'bg-green-500', icon: CheckCircle };
    if (confidence >= 75) return { label: 'High', color: 'bg-blue-500', icon: CheckCircle };
    if (confidence >= 60) return { label: 'Medium', color: 'bg-yellow-500', icon: AlertCircle };
    return { label: 'Low', color: 'bg-red-500', icon: XCircle };
  };

  const level = getConfidenceLevel(confidence);
  const Icon = level.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div className="space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={`${level.color} text-white ${sizeClasses[size]} flex items-center gap-1`}>
              <Brain className="w-3 h-3" />
              {confidence}% {level.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <div className="space-y-2">
              <p className="font-medium">AI Confidence Explanation:</p>
              <p className="text-sm">{explanation}</p>
              {factors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Contributing factors:</p>
                  {factors.map((factor, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <Icon className={`w-3 h-3 ${
                        factor.impact === 'positive' ? 'text-green-500' : 
                        factor.impact === 'negative' ? 'text-red-500' : 'text-gray-500'
                      }`} />
                      <span>{factor.name}</span>
                      <span className="text-muted-foreground">({factor.weight}%)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {showProgress && (
        <div className="space-y-1">
          <Progress value={confidence} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Confidence: {confidence}% - {explanation}
          </p>
        </div>
      )}
    </div>
  );
}
