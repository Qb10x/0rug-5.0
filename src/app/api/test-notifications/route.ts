import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/alerts/notificationService';

// Test API endpoint for notification testing
export async function POST(request: NextRequest) {
  try {
    // Initialize notification service
    const notificationService = new NotificationService({
      enabledChannels: ['telegram', 'discord'],
      telegramBotToken: process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN,
      telegramChatId: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID,
      discordWebhookUrl: process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL
    });

    // Test notification channels
    const results = await notificationService.testChannels();
    
    return NextResponse.json({
      success: true,
      results,
      message: 'Notification test completed',
      telegram: results.telegram ? '✅ Working' : '❌ Failed',
      discord: results.discord ? '✅ Working' : '❌ Failed'
    });

  } catch (error) {
    console.error('Error in test-notifications:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        results: { telegram: false, discord: false }
      },
      { status: 500 }
    );
  }
} 