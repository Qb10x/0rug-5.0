// ORC Real-Time Alert Sender - following 0rug.com coding guidelines

import { ALERT_CONFIG } from '../shared/orcConstants';

// Alert message interface
interface AlertMessage {
  type: 'whale_movement' | 'swap_detected' | 'pool_risk' | 'liquidity_change';
  title: string;
  message: string;
  data: Record<string, unknown>;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

// Alert configuration interface
interface AlertConfig {
  telegramBotToken?: string;
  telegramChatId?: string;
  discordWebhookUrl?: string;
  isEnabled: boolean;
  cooldownMs: number;
  maxAlertsPerHour: number;
}

// Send real-time alerts to Telegram and Discord
export async function sendAlert(alert: AlertMessage): Promise<boolean> {
  try {
    const config = getAlertConfig();
    
    if (!config.isEnabled) {
      console.log('Alerts disabled, skipping alert:', alert.title);
      return false;
    }

    // Check rate limiting
    if (!isRateLimitAllowed()) {
      console.warn('Rate limit exceeded, skipping alert');
      return false;
    }

    // Send to Telegram if configured
    if (config.telegramBotToken && config.telegramChatId) {
      await sendTelegramAlert(alert, config);
    }

    // Send to Discord if configured
    if (config.discordWebhookUrl) {
      await sendDiscordAlert(alert, config);
    }

    // Record alert for rate limiting
    recordAlertSent();

    return true;
  } catch (error) {
    console.error('Error sending alert:', error);
    return false;
  }
}

// Send alert to Telegram
async function sendTelegramAlert(alert: AlertMessage, config: AlertConfig): Promise<void> {
  try {
    const message = formatTelegramMessage(alert);
    const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.telegramChatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    console.log('Telegram alert sent successfully');
  } catch (error) {
    console.error('Error sending Telegram alert:', error);
    throw error;
  }
}

// Send alert to Discord
async function sendDiscordAlert(alert: AlertMessage, config: AlertConfig): Promise<void> {
  try {
    const embed = formatDiscordEmbed(alert);
    const url = config.discordWebhookUrl!;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed]
      })
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    console.log('Discord alert sent successfully');
  } catch (error) {
    console.error('Error sending Discord alert:', error);
    throw error;
  }
}

// Format message for Telegram
function formatTelegramMessage(alert: AlertMessage): string {
  const emoji = getAlertEmoji(alert.type);
  const priority = getPriorityEmoji(alert.priority);
  
  return `${emoji} <b>${alert.title}</b> ${priority}

${alert.message}

📊 <b>Details:</b>
${formatAlertData(alert.data)}

⏰ ${new Date(alert.timestamp).toLocaleString()}

#0rug #Solana #DEX`;
}

// Format embed for Discord
function formatDiscordEmbed(alert: AlertMessage): Record<string, unknown> {
  const emoji = getAlertEmoji(alert.type);
  const color = getPriorityColor(alert.priority);
  
  return {
    title: `${emoji} ${alert.title}`,
    description: alert.message,
    color: color,
    fields: [
      {
        name: '📊 Details',
        value: formatAlertData(alert.data),
        inline: false
      },
      {
        name: '⏰ Timestamp',
        value: new Date(alert.timestamp).toLocaleString(),
        inline: true
      },
      {
        name: '🚨 Priority',
        value: alert.priority.toUpperCase(),
        inline: true
      }
    ],
    footer: {
      text: '0rug Analytics - Solana DEX Monitoring'
    },
    timestamp: alert.timestamp
  };
}

// Get alert emoji based on type
function getAlertEmoji(type: AlertMessage['type']): string {
  const emojiMap: Record<AlertMessage['type'], string> = {
    whale_movement: '🐋',
    swap_detected: '💱',
    pool_risk: '⚠️',
    liquidity_change: '💧'
  };
  return emojiMap[type] || '🔔';
}

// Get priority emoji
function getPriorityEmoji(priority: AlertMessage['priority']): string {
  const emojiMap: Record<AlertMessage['priority'], string> = {
    low: '🟢',
    medium: '🟡',
    high: '🔴'
  };
  return emojiMap[priority] || '⚪';
}

// Get priority color for Discord
function getPriorityColor(priority: AlertMessage['priority']): number {
  const colorMap: Record<AlertMessage['priority'], number> = {
    low: 0x00ff00, // Green
    medium: 0xffff00, // Yellow
    high: 0xff0000 // Red
  };
  return colorMap[priority] || 0x808080; // Gray
}

// Format alert data for display
function formatAlertData(data: Record<string, unknown>): string {
  return Object.entries(data)
    .map(([key, value]) => `• ${key}: ${value}`)
    .join('\n');
}

// Get alert configuration from environment
function getAlertConfig(): AlertConfig {
  return {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    telegramChatId: process.env.TELEGRAM_CHAT_ID,
    discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
    isEnabled: process.env.ALERTS_ENABLED === 'true',
    cooldownMs: ALERT_CONFIG.cooldownMs,
    maxAlertsPerHour: 100
  };
}

// Rate limiting for alerts
let alertCount = 0;
let lastAlertTime = 0;

// Check if rate limit allows sending alert
function isRateLimitAllowed(): boolean {
  const now = Date.now();
  const config = getAlertConfig();
  
  // Reset counter if hour has passed
  if (now - lastAlertTime > 3600000) {
    alertCount = 0;
  }
  
  // Check if we're under the limit
  if (alertCount >= config.maxAlertsPerHour) {
    return false;
  }
  
  // Check cooldown
  if (now - lastAlertTime < config.cooldownMs) {
    return false;
  }
  
  return true;
}

// Record that an alert was sent
function recordAlertSent(): void {
  alertCount++;
  lastAlertTime = Date.now();
}

// Create whale movement alert
export function createWhaleAlert(whaleData: {
  whaleAddress: string;
  operation: string;
  amount: number;
  transactionHash: string;
}): AlertMessage {
  return {
    type: 'whale_movement',
    title: '🐋 Whale Movement Detected',
    message: `Large whale activity detected on Solana network.`,
    data: {
      'Whale Address': whaleData.whaleAddress.slice(0, 8) + '...',
      'Operation': whaleData.operation,
      'Amount': `$${whaleData.amount.toLocaleString()}`,
      'Transaction': whaleData.transactionHash.slice(0, 8) + '...'
    },
    timestamp: new Date().toISOString(),
    priority: whaleData.amount > 100000 ? 'high' : whaleData.amount > 10000 ? 'medium' : 'low'
  };
}

// Create swap alert
export function createSwapAlert(swapData: {
  dexName: string;
  tokenIn: string;
  tokenOut: string;
  swapSize: number;
  transactionHash: string;
}): AlertMessage {
  return {
    type: 'swap_detected',
    title: '💱 Large Swap Detected',
    message: `Significant swap detected on ${swapData.dexName}.`,
    data: {
      'DEX': swapData.dexName,
      'Input Token': swapData.tokenIn.slice(0, 8) + '...',
      'Output Token': swapData.tokenOut.slice(0, 8) + '...',
      'Swap Size': `$${swapData.swapSize.toLocaleString()}`,
      'Transaction': swapData.transactionHash.slice(0, 8) + '...'
    },
    timestamp: new Date().toISOString(),
    priority: swapData.swapSize > 100000 ? 'high' : swapData.swapSize > 10000 ? 'medium' : 'low'
  };
}

// Create pool risk alert
export function createPoolRiskAlert(riskData: {
  poolAddress: string;
  riskScore: number;
  riskLevel: string;
  riskFactors: string[];
}): AlertMessage {
  return {
    type: 'pool_risk',
    title: '⚠️ Pool Risk Alert',
    message: `High risk detected in liquidity pool.`,
    data: {
      'Pool Address': riskData.poolAddress.slice(0, 8) + '...',
      'Risk Score': `${riskData.riskScore}/100`,
      'Risk Level': riskData.riskLevel,
      'Risk Factors': riskData.riskFactors.slice(0, 3).join(', ')
    },
    timestamp: new Date().toISOString(),
    priority: riskData.riskScore < 30 ? 'high' : riskData.riskScore < 60 ? 'medium' : 'low'
  };
} 