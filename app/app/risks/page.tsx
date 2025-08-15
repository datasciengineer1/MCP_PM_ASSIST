
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Filter, AlertTriangle, Shield, User, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ClientDate } from '@/components/date-display';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';

interface Risk {
  id: string;
  title: string;
  description: string;
  category: string;
  probability: string;
  impact: string;
  status: string;
  mitigation?: string;
  owner?: string;
  dueDate?: string;
  projectId: string;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
}

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRisk, setNewRisk] = useState({
    title: '',
    description: '',
    category: 'TECHNICAL',
    probability: 'MEDIUM',
    impact: 'MEDIUM',
    projectId: '',
    mitigation: '',
    owner: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRisks();
    fetchProjects();
  }, []);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/risks');
      if (response.ok) {
        const data = await response.json();
        setRisks(data);
      }
    } catch (error) {
      console.error('Error fetching risks:', error);
      toast({
        title: "Error",
        description: "Failed to load risks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleCreateRisk = async () => {
    try {
      const response = await fetch('/api/risks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRisk),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Risk created successfully",
        });
        setIsCreateOpen(false);
        setNewRisk({
          title: '',
          description: '',
          category: 'TECHNICAL',
          probability: 'MEDIUM',
          impact: 'MEDIUM',
          projectId: '',
          mitigation: '',
          owner: ''
        });
        fetchRisks();
      } else {
        throw new Error('Failed to create risk');
      }
    } catch (error) {
      console.error('Error creating risk:', error);
      toast({
        title: "Error",
        description: "Failed to create risk",
        variant: "destructive"
      });
    }
  };

  const filteredRisks = risks.filter(risk => {
    const matchesSearch = risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         risk.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || risk.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-green-500';
      case 'MITIGATING': return 'bg-blue-500';
      case 'ASSESSING': return 'bg-yellow-500';
      case 'IDENTIFIED': return 'bg-gray-500';
      case 'CLOSED': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskScore = (probability: string, impact: string) => {
    const probValue = probability === 'LOW' ? 1 : probability === 'MEDIUM' ? 2 : probability === 'HIGH' ? 3 : 4;
    const impactValue = impact === 'LOW' ? 1 : impact === 'MEDIUM' ? 2 : impact === 'HIGH' ? 3 : 4;
    return probValue * impactValue;
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 12) return 'text-red-600';
    if (score >= 6) return 'text-orange-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="hidden lg:block" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Risk Management" 
          subtitle="Identify, assess, and mitigate project risks"
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div></div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Risk
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Risk</DialogTitle>
              <DialogDescription>
                Add a new risk to your project risk register
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select
                  value={newRisk.projectId}
                  onValueChange={(value) => setNewRisk(prev => ({ ...prev, projectId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Risk Title</Label>
                <Input
                  id="title"
                  value={newRisk.title}
                  onChange={(e) => setNewRisk(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter risk title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRisk.description}
                  onChange={(e) => setNewRisk(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the risk"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newRisk.category}
                    onValueChange={(value) => setNewRisk(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TECHNICAL">Technical</SelectItem>
                      <SelectItem value="BUSINESS">Business</SelectItem>
                      <SelectItem value="OPERATIONAL">Operational</SelectItem>
                      <SelectItem value="FINANCIAL">Financial</SelectItem>
                      <SelectItem value="TIMELINE">Timeline</SelectItem>
                      <SelectItem value="RESOURCE">Resource</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="probability">Probability</Label>
                  <Select
                    value={newRisk.probability}
                    onValueChange={(value) => setNewRisk(prev => ({ ...prev, probability: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="impact">Impact</Label>
                  <Select
                    value={newRisk.impact}
                    onValueChange={(value) => setNewRisk(prev => ({ ...prev, impact: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mitigation">Mitigation Strategy</Label>
                <Textarea
                  id="mitigation"
                  value={newRisk.mitigation}
                  onChange={(e) => setNewRisk(prev => ({ ...prev, mitigation: e.target.value }))}
                  placeholder="Describe mitigation strategy"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner">Risk Owner</Label>
                <Input
                  id="owner"
                  value={newRisk.owner}
                  onChange={(e) => setNewRisk(prev => ({ ...prev, owner: e.target.value }))}
                  placeholder="Assign risk owner"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRisk}>
                  Create Risk
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search risks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="TECHNICAL">Technical</SelectItem>
            <SelectItem value="BUSINESS">Business</SelectItem>
            <SelectItem value="OPERATIONAL">Operational</SelectItem>
            <SelectItem value="FINANCIAL">Financial</SelectItem>
            <SelectItem value="TIMELINE">Timeline</SelectItem>
            <SelectItem value="RESOURCE">Resource</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Risks Grid */}
      <div className="grid gap-4">
        {filteredRisks.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-10">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">No risks found</p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first risk
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredRisks.map((risk) => {
            const riskScore = getRiskScore(risk.probability, risk.impact);
            return (
              <Card key={risk.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <CardTitle className="text-lg">{risk.title}</CardTitle>
                      </div>
                      <CardDescription className="mt-2">
                        {risk.description}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getRiskScoreColor(riskScore)}`}>
                          {riskScore}
                        </div>
                        <div className="text-xs text-muted-foreground">Risk Score</div>
                      </div>
                      <Badge className={`${getStatusColor(risk.status)} text-white`}>
                        {risk.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <Badge className={`${getRiskLevelColor(risk.probability)} text-white`}>
                        Probability: {risk.probability}
                      </Badge>
                      <Badge className={`${getRiskLevelColor(risk.impact)} text-white`}>
                        Impact: {risk.impact}
                      </Badge>
                      <Badge variant="outline">{risk.category}</Badge>
                    </div>
                    
                    {risk.mitigation && (
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-green-500 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium">Mitigation</div>
                          <div className="text-sm text-muted-foreground">{risk.mitigation}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {risk.owner && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {risk.owner}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <ClientDate date={risk.createdAt} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
          </div>
        </main>
      </div>
    </div>
  );
}
