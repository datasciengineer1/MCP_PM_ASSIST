
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GitBranch, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Brain
} from 'lucide-react';

interface DecisionNode {
  id: string;
  question: string;
  answer: string;
  reasoning: string;
  confidence: number;
  children?: DecisionNode[];
}

interface DecisionTreeProps {
  title: string;
  description: string;
  rootNode: DecisionNode;
  finalDecision: string;
}

export function DecisionTree({
  title,
  description,
  rootNode,
  finalDecision
}: DecisionTreeProps) {
  const renderNode = (node: DecisionNode, level: number = 0) => {
    const indentClass = level > 0 ? `ml-${level * 6}` : '';
    
    return (
      <div key={node.id} className={`space-y-3 ${indentClass}`}>
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 min-w-fit">
            <GitBranch className="w-4 h-4 text-blue-500" />
            <Badge variant="outline" className="text-xs">
              {node.confidence}%
            </Badge>
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{node.question}</p>
            <div className="flex items-center gap-2 mt-1">
              {node.answer.toLowerCase().includes('yes') || node.answer.toLowerCase().includes('true') ? 
                <CheckCircle className="w-3 h-3 text-green-500" /> : 
                <XCircle className="w-3 h-3 text-red-500" />
              }
              <span className="text-sm text-muted-foreground">{node.answer}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 bg-gray-50 p-2 rounded">
              <strong>Reasoning:</strong> {node.reasoning}
            </p>
          </div>
        </div>
        
        {node.children && node.children.length > 0 && (
          <div className="border-l-2 border-dashed border-gray-300 pl-4 ml-2">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {renderNode(rootNode)}
          
          <div className="flex items-center gap-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <ArrowRight className="w-4 h-4 text-purple-500" />
            <div>
              <p className="font-semibold text-purple-800">Final Decision:</p>
              <p className="text-sm text-purple-700">{finalDecision}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
