
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  HelpCircle, 
  Lightbulb, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Brain,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ExplainerCardProps {
  title: string;
  description: string;
  reasoning?: string;
  confidence?: number;
  factors?: string[];
  recommendations?: string[];
  type?: 'insight' | 'warning' | 'success' | 'info';
  aiDecision?: {
    method: string;
    criteria: string[];
    alternatives: string[];
  };
  children?: React.ReactNode;
}

export function ExplainerCard({
  title,
  description,
  reasoning,
  confidence = 85,
  factors = [],
  recommendations = [],
  type = 'info',
  aiDecision,
  children
}: ExplainerCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getTypeIcon = () => {
    switch (type) {
      case 'insight': return <Lightbulb className="w-5 h-5 text-blue-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50';
    if (confidence >= 75) return 'text-blue-600 bg-blue-50';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon()}
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={`${getConfidenceColor(confidence)} border-0`}>
                  {confidence}% confidence
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>AI confidence level in this analysis</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        {children}
        
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Show AI Reasoning
              </div>
              <HelpCircle className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4 pt-4 border-t">
            {reasoning && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  Why this decision was made:
                </h4>
                <p className="text-sm text-muted-foreground bg-purple-50 p-3 rounded-lg">
                  {reasoning}
                </p>
              </div>
            )}

            {factors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Key factors considered:
                </h4>
                <ul className="space-y-1">
                  {factors.map((factor, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiDecision && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Brain className="w-4 h-4 text-green-500" />
                  AI Decision Process:
                </h4>
                <div className="bg-green-50 p-3 rounded-lg space-y-2">
                  <p className="text-sm"><strong>Method:</strong> {aiDecision.method}</p>
                  <div>
                    <p className="text-sm font-medium">Criteria used:</p>
                    <ul className="text-sm text-muted-foreground ml-4 mt-1">
                      {aiDecision.criteria.map((criterion, index) => (
                        <li key={index}>• {criterion}</li>
                      ))}
                    </ul>
                  </div>
                  {aiDecision.alternatives.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Alternatives considered:</p>
                      <ul className="text-sm text-muted-foreground ml-4 mt-1">
                        {aiDecision.alternatives.map((alt, index) => (
                          <li key={index}>• {alt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  Recommendations:
                </h4>
                <ul className="space-y-1">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
