
import { NextResponse } from 'next/server';

// For now, we'll use a simple in-memory storage
// In production, this should be stored in the database
let settings = {
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
};

export async function GET() {
  try {
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Merge the new settings with existing ones
    settings = {
      ...settings,
      ...body,
    };

    return NextResponse.json({ message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
