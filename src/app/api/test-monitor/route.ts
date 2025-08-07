import { NextRequest, NextResponse } from 'next/server';
import { AlertEngine } from '@/lib/alerts/alertEngine';

// Test API endpoint for monitoring tokens
export async function POST(request: NextRequest) {
  try {
    const { tokenAddress } = await request.json();
    
    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Token address is required' },
        { status: 400 }
      );
    }

    // Initialize alert engine
    const alertEngine = new AlertEngine({
      whaleThreshold: 10000,
      volumeSpikeThreshold: 5,
      rugPullConfidence: 70,
      enabledChannels: ['telegram', 'discord'],
      autoAnalysis: true,
      notificationsEnabled: false // Disable notifications for testing
    });

    // Monitor the token
    const alerts = await alertEngine.monitorToken(tokenAddress);
    
    return NextResponse.json({
      success: true,
      tokenAddress,
      alertsFound: alerts.length,
      alerts: alerts.map(alert => ({
        id: alert.id,
        type: alert.type,
        priority: alert.priority,
        description: alert.description,
        timestamp: alert.timestamp
      }))
    });

  } catch (error) {
    console.error('Error in test-monitor:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 