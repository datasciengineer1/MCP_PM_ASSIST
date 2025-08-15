
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save, Key, Database, Bell, Palette, Shield, Download } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';

interface Settings {
  general: {
    appName: string;
    defaultProject: string;
    theme: string;
    autoSave: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    taskDeadlines: boolean;
    projectUpdates: boolean;
    riskAlerts: boolean;
  };
  integrations: {
    apiKey: string;
    webhookUrl: string;
    slackIntegration: boolean;
  };
  advanced: {
    debugMode: boolean;
    dataRetention: number;
    backupFrequency: string;
  };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<Settings>({
    general: {
      appName: 'PM Assistant MVP',
      defaultProject: '',
      theme: 'system',
      autoSave: true,
    },
    notifications: {
      emailNotifications: true,
      taskDeadlines: true,
      projectUpdates: false,
      riskAlerts: true,
    },
    integrations: {
      apiKey: '',
      webhookUrl: '',
      slackIntegration: false,
    },
    advanced: {
      debugMode: false,
      dataRetention: 365,
      backupFrequency: 'weekly',
    },
  });
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Array<{ id: string; title: string }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
    fetchProjects();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
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

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Settings saved successfully",
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = (section: keyof Settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleExportData = async () => {
    try {
      toast({
        title: "Export Started",
        description: "Your data export is being prepared",
      });
      // Implementation would go here
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="hidden lg:block" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Settings" 
          subtitle="Configure your PM Assistant preferences"
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div></div>
        
        <Button onClick={handleSaveSettings} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger 
            value="general" 
            onClick={() => setActiveTab('general')}
          >
            General
          </TabsTrigger>
          <TabsTrigger 
            value="notifications"
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="integrations"
            onClick={() => setActiveTab('integrations')}
          >
            Integrations
          </TabsTrigger>
          <TabsTrigger 
            value="advanced"
            onClick={() => setActiveTab('advanced')}
          >
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic application preferences and defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="appName">Application Name</Label>
                  <Input
                    id="appName"
                    value={settings.general.appName}
                    onChange={(e) => updateSettings('general', 'appName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultProject">Default Project</Label>
                  <Select
                    value={settings.general.defaultProject}
                    onValueChange={(value) => updateSettings('general', 'defaultProject', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={settings.general.theme}
                    onValueChange={(value) => updateSettings('general', 'theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoSave"
                    checked={settings.general.autoSave}
                    onCheckedChange={(checked) => updateSettings('general', 'autoSave', checked)}
                  />
                  <Label htmlFor="autoSave">Auto-save changes</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose when and how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailNotifications"
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => updateSettings('notifications', 'emailNotifications', checked)}
                  />
                  <Label htmlFor="emailNotifications">Email notifications</Label>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Specific Notifications</h4>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="taskDeadlines"
                      checked={settings.notifications.taskDeadlines}
                      onCheckedChange={(checked) => updateSettings('notifications', 'taskDeadlines', checked)}
                    />
                    <Label htmlFor="taskDeadlines">Task deadline reminders</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="projectUpdates"
                      checked={settings.notifications.projectUpdates}
                      onCheckedChange={(checked) => updateSettings('notifications', 'projectUpdates', checked)}
                    />
                    <Label htmlFor="projectUpdates">Project status updates</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="riskAlerts"
                      checked={settings.notifications.riskAlerts}
                      onCheckedChange={(checked) => updateSettings('notifications', 'riskAlerts', checked)}
                    />
                    <Label htmlFor="riskAlerts">High-priority risk alerts</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API & Integrations
              </CardTitle>
              <CardDescription>
                Connect with external services and configure API access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiKey"
                    type="password"
                    value={settings.integrations.apiKey}
                    onChange={(e) => updateSettings('integrations', 'apiKey', e.target.value)}
                    placeholder="Enter your API key"
                  />
                  <Button variant="outline" size="sm">
                    Generate
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={settings.integrations.webhookUrl}
                  onChange={(e) => updateSettings('integrations', 'webhookUrl', e.target.value)}
                  placeholder="https://your-webhook-url.com"
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="slackIntegration"
                  checked={settings.integrations.slackIntegration}
                  onCheckedChange={(checked) => updateSettings('integrations', 'slackIntegration', checked)}
                />
                <Label htmlFor="slackIntegration">Enable Slack integration</Label>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Advanced Settings
              </CardTitle>
              <CardDescription>
                System configuration and data management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="debugMode"
                  checked={settings.advanced.debugMode}
                  onCheckedChange={(checked) => updateSettings('advanced', 'debugMode', checked)}
                />
                <Label htmlFor="debugMode">Debug mode</Label>
                <Badge variant="destructive">Development Only</Badge>
              </div>
              
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dataRetention">Data Retention (days)</Label>
                  <Input
                    id="dataRetention"
                    type="number"
                    value={settings.advanced.dataRetention}
                    onChange={(e) => updateSettings('advanced', 'dataRetention', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select
                    value={settings.advanced.backupFrequency}
                    onValueChange={(value) => updateSettings('advanced', 'backupFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Data Management</h4>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" disabled>
                    <Database className="w-4 h-4 mr-2" />
                    Backup Database
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
