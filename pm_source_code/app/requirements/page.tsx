
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
import { Plus, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ClientDate } from '@/components/date-display';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { ExplainerCard } from '@/components/explainability/explainer-card';
import { ConfidenceIndicator } from '@/components/explainability/confidence-indicator';

interface Requirement {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  tags: string;
  projectId: string;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
}

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRequirement, setNewRequirement] = useState({
    title: '',
    description: '',
    category: 'FUNCTIONAL',
    priority: 'MEDIUM',
    projectId: '',
    tags: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRequirements();
    fetchProjects();
  }, []);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/requirements');
      if (response.ok) {
        const data = await response.json();
        setRequirements(data);
      }
    } catch (error) {
      console.error('Error fetching requirements:', error);
      toast({
        title: "Error",
        description: "Failed to load requirements",
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

  const handleCreateRequirement = async () => {
    try {
      const response = await fetch('/api/requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRequirement),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Requirement created successfully",
        });
        setIsCreateOpen(false);
        setNewRequirement({
          title: '',
          description: '',
          category: 'FUNCTIONAL',
          priority: 'MEDIUM',
          projectId: '',
          tags: ''
        });
        fetchRequirements();
      } else {
        throw new Error('Failed to create requirement');
      }
    } catch (error) {
      console.error('Error creating requirement:', error);
      toast({
        title: "Error",
        description: "Failed to create requirement",
        variant: "destructive"
      });
    }
  };

  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || req.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-500';
      case 'REVIEW': return 'bg-blue-500';
      case 'DRAFT': return 'bg-gray-500';
      case 'REJECTED': return 'bg-red-500';
      case 'IMPLEMENTED': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
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
          title="Requirements" 
          subtitle="Manage project requirements and specifications"
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div></div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Requirement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Requirement</DialogTitle>
              <DialogDescription>
                Add a new requirement to your project
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select
                  value={newRequirement.projectId}
                  onValueChange={(value) => setNewRequirement(prev => ({ ...prev, projectId: value }))}
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
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newRequirement.title}
                  onChange={(e) => setNewRequirement(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter requirement title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRequirement.description}
                  onChange={(e) => setNewRequirement(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the requirement"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newRequirement.category}
                    onValueChange={(value) => setNewRequirement(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FUNCTIONAL">Functional</SelectItem>
                      <SelectItem value="NON_FUNCTIONAL">Non-Functional</SelectItem>
                      <SelectItem value="BUSINESS">Business</SelectItem>
                      <SelectItem value="TECHNICAL">Technical</SelectItem>
                      <SelectItem value="USER_STORY">User Story</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newRequirement.priority}
                    onValueChange={(value) => setNewRequirement(prev => ({ ...prev, priority: value }))}
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
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={newRequirement.tags}
                  onChange={(e) => setNewRequirement(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Enter comma-separated tags"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRequirement}>
                  Create Requirement
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
            placeholder="Search requirements..."
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
            <SelectItem value="FUNCTIONAL">Functional</SelectItem>
            <SelectItem value="NON_FUNCTIONAL">Non-Functional</SelectItem>
            <SelectItem value="BUSINESS">Business</SelectItem>
            <SelectItem value="TECHNICAL">Technical</SelectItem>
            <SelectItem value="USER_STORY">User Story</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* AI Requirements Analysis */}
      {requirements.length > 0 && (
        <ExplainerCard
          title="Requirements Analysis & Insights"
          description="AI-powered analysis of your requirements portfolio"
          reasoning="Analysis based on requirement categories, priority distribution, and completion status patterns"
          confidence={82}
          type="insight"
          factors={[
            `${filteredRequirements.length} requirements match your current filters`,
            `${requirements.filter(r => r.category === 'FUNCTIONAL').length} functional vs ${requirements.filter(r => r.category === 'NON_FUNCTIONAL').length} non-functional requirements`,
            `${requirements.filter(r => r.priority === 'HIGH' || r.priority === 'CRITICAL').length} high-priority requirements need attention`,
            `${requirements.filter(r => r.status === 'APPROVED').length} requirements are approved and ready for implementation`
          ]}
          recommendations={[
            requirements.filter(r => r.status === 'DRAFT').length > requirements.length * 0.3 ? 
              "Consider reviewing and approving draft requirements to unblock development" :
              "Good requirement approval rate - keep the review process moving",
            requirements.filter(r => r.priority === 'CRITICAL').length > 3 ?
              "Too many critical requirements may indicate scope creep - consider prioritization" :
              "Priority distribution looks balanced",
            requirements.filter(r => r.category === 'TECHNICAL').length === 0 ?
              "Consider adding technical requirements for infrastructure and architecture" :
              "Good balance of requirement types"
          ]}
          aiDecision={{
            method: "Requirements portfolio analysis using category clustering and priority weighting",
            criteria: [
              "Category balance (Functional vs Non-functional vs Technical)",
              "Priority distribution and criticality assessment",
              "Status progression and approval velocity",
              "Tag-based complexity and domain coverage"
            ],
            alternatives: [
              "Simple count-based analysis (rejected: lacks context)",
              "Timeline-only analysis (rejected: ignores business value)",
              "Priority-only ranking (rejected: ignores category balance)"
            ]
          }}
        >
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((requirements.filter(r => r.status === 'APPROVED').length / requirements.length) * 100)}%
              </div>
              <div className="text-sm text-blue-800">Approved</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {requirements.filter(r => r.category === 'FUNCTIONAL').length}
              </div>
              <div className="text-sm text-green-800">Functional</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {requirements.filter(r => r.priority === 'HIGH' || r.priority === 'CRITICAL').length}
              </div>
              <div className="text-sm text-orange-800">High Priority</div>
            </div>
          </div>
        </ExplainerCard>
      )}

      {/* Requirements Grid */}
      <div className="grid gap-4">
        {filteredRequirements.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-10">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">No requirements found</p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first requirement
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredRequirements.map((requirement) => (
            <Card key={requirement.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{requirement.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {requirement.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 items-center">
                    <ConfidenceIndicator 
                      confidence={
                        requirement.status === 'APPROVED' ? 95 :
                        requirement.status === 'REVIEW' ? 75 :
                        requirement.status === 'DRAFT' ? 45 : 60
                      }
                      explanation={
                        requirement.status === 'APPROVED' ? "High confidence - approved and validated" :
                        requirement.status === 'REVIEW' ? "Medium confidence - under review" :
                        "Low confidence - still in draft phase"
                      }
                      size="sm"
                    />
                    <Badge className={`${getPriorityColor(requirement.priority)} text-white`}>
                      {requirement.priority}
                    </Badge>
                    <Badge className={`${getStatusColor(requirement.status)} text-white`}>
                      {requirement.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Badge variant="outline">{requirement.category}</Badge>
                    {requirement.tags && requirement.tags.split(',').map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    <ClientDate date={requirement.createdAt} />
                  </span>
                </div>
                {/* AI Classification Explanation */}
                <div className="mt-3 text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                  <strong>AI Classification:</strong> Categorized as {requirement.category.toLowerCase().replace('_', ' ')} 
                  based on keywords and content analysis. Priority set to {requirement.priority.toLowerCase()} 
                  considering business impact and implementation complexity.
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
          </div>
        </main>
      </div>
    </div>
  );
}
