import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// Verify webhook secret
function verifyWebhook(req: NextRequest): boolean {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const authHeader = req.headers.get('x-telegram-bot-api-secret-token');
  
  return webhookSecret === authHeader;
}

// Send message to Telegram user
async function sendTelegramMessage(chatId: string, message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    return data.ok;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
}

// Get chat ID from username
async function getChatIdFromUsername(username: string): Promise<string | null> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    return null;
  }

  try {
    // First, try to get updates to see if user has interacted with bot
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
    const data = await response.json();
    
    if (data.ok && data.result) {
      for (const update of data.result) {
        if (update.message?.from?.username === username.replace('@', '')) {
          return update.message.chat.id.toString();
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get chat ID:', error);
    return null;
  }
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

// Handle verification code sending
export async function sendVerificationCode(username: string, code: string, type: 'signup' | 'password_reset') {
  try {
    // Remove @ if present
    const cleanUsername = username.replace('@', '');
    
    // Get chat ID from username
    const chatId = await getChatIdFromUsername(cleanUsername);
    
    if (!chatId) {
      console.error(`Could not find chat ID for username: ${cleanUsername}`);
      return false;
    }

    // Create message based on type
    const message = type === 'signup' 
      ? `
🔐 <b>0RUG Verification Code</b>

Your 0RUG verification code is:
<code>${code}</code>

This code expires in 10 minutes.

If you didn't request this code, please ignore this message.
      `.trim()
      : `
🔑 <b>0RUG Password Reset Code</b>

Your 0RUG password reset code is:
<code>${code}</code>

This code expires in 15 minutes.

If you didn't request this reset, please ignore this message.
      `.trim();

    return await sendTelegramMessage(chatId, message);
  } catch (error) {
    console.error('Failed to send verification code:', error);
    return false;
  }
} 