import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/api/telegram';

// Verify webhook secret
function verifyWebhook(req: NextRequest): boolean {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const authHeader = req.headers.get('x-telegram-bot-api-secret-token');
  
  return webhookSecret === authHeader;
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    if (!verifyWebhook(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Handle incoming messages
    if (body.message) {
      const { chat, text, from } = body.message;
      
      // Handle /start command
      if (text === '/start') {
        const welcomeMessage = `
🤖 <b>Welcome to 0RUG Verification Bot!</b>

I'll help you receive verification codes for your 0RUG account.

To get started:
1. Go to 0RUG.com and sign up
2. Enter your Telegram username: <code>@${from.username || 'your_username'}</code>
3. I'll send you verification codes here

Need help? Contact @orugsol
        `.trim();

        await sendTelegramMessage(chat.id.toString(), welcomeMessage);
      }
      
      // Handle /help command
      else if (text === '/help') {
        const helpMessage = `
🔧 <b>0RUG Bot Help</b>

<b>Commands:</b>
/start - Start the bot
/help - Show this help message

<b>How it works:</b>
1. Sign up at 0RUG.com
2. Enter your Telegram username
3. Receive verification codes here
4. Enter codes on the website

<b>Support:</b>
Contact @orugsol for help
        `.trim();

        await sendTelegramMessage(chat.id.toString(), helpMessage);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

 