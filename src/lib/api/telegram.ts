// Telegram utility functions for sending messages and verification codes

// Send message to Telegram user
export async function sendTelegramMessage(chatId: string, message: string) {
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
export async function getChatIdFromUsername(username: string): Promise<string | null> {
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