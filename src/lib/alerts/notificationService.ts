interface AlertNotification {
  id: string;
  type: 'whale' | 'swap' | 'rug' | 'volume' | 'new_token' | 'honeypot';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  tokenAddress?: string;
  amount?: string;
  timestamp: Date;
}

interface NotificationConfig {
  telegramBotToken?: string;
  telegramChatId?: string;
  discordWebhookUrl?: string;
  enabledChannels: string[];
}

// Notification service for sending alerts to Telegram and Discord
export class NotificationService {
  private config: NotificationConfig;

  constructor(config: NotificationConfig) {
    this.config = config;
  }

  // Send alert to all configured channels
  async sendAlert(alert: AlertNotification): Promise<boolean> {
    const results = await Promise.allSettled([
      ...(this.config.enabledChannels.includes('telegram') ? [this.sendToTelegram(alert)] : []),
      ...(this.config.enabledChannels.includes('discord') ? [this.sendToDiscord(alert)] : [])
    ]);

    return results.some(result => result.status === 'fulfilled');
  }

  // Send alert to Telegram
  private async sendToTelegram(alert: AlertNotification): Promise<boolean> {
    if (!this.config.telegramBotToken || !this.config.telegramChatId) {
      console.warn('Telegram not configured');
      return false;
    }

    try {
      const message = this.formatTelegramMessage(alert);
      const url = `https://api.telegram.org/bot${this.config.telegramBotToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.config.telegramChatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending to Telegram:', error);
      return false;
    }
  }

  // Send alert to Discord
  private async sendToDiscord(alert: AlertNotification): Promise<boolean> {
    if (!this.config.discordWebhookUrl) {
      console.warn('Discord not configured');
      return false;
    }

    try {
      const embed = this.formatDiscordEmbed(alert);
      
      const response = await fetch(this.config.discordWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [embed]
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending to Discord:', error);
      return false;
    }
  }

  // Format message for Telegram
  private formatTelegramMessage(alert: AlertNotification): string {
    const emoji = this.getAlertEmoji(alert.type);
    const priority = this.getPriorityEmoji(alert.priority);
    
    let message = `${priority} <b>${alert.title}</b>\n\n`;
    message += `${emoji} ${alert.description}\n\n`;
    
    if (alert.tokenAddress) {
      message += `🔗 Token: <code>${alert.tokenAddress}</code>\n`;
    }
    
    if (alert.amount) {
      message += `💰 Amount: ${alert.amount}\n`;
    }
    
    message += `⏰ ${alert.timestamp.toLocaleString()}\n`;
    message += `\n#${alert.type.toUpperCase()} #ALERT`;
    
    return message;
  }

  // Format embed for Discord
  private formatDiscordEmbed(alert: AlertNotification): any {
    const color = this.getPriorityColor(alert.priority);
    const emoji = this.getAlertEmoji(alert.type);
    
    const embed = {
      title: `${emoji} ${alert.title}`,
      description: alert.description,
      color: color,
      timestamp: alert.timestamp.toISOString(),
      fields: [] as any[],
      footer: {
        text: '0rug Analytics - AI-Powered Alerts'
      }
    };

    if (alert.tokenAddress) {
      embed.fields.push({
        name: 'Token Address',
        value: `\`${alert.tokenAddress}\``,
        inline: true
      });
    }

    if (alert.amount) {
      embed.fields.push({
        name: 'Amount',
        value: alert.amount,
        inline: true
      });
    }

    embed.fields.push({
      name: 'Priority',
      value: alert.priority.toUpperCase(),
      inline: true
    });

    return embed;
  }

  // Get emoji for alert type
  private getAlertEmoji(type: string): string {
    switch (type) {
      case 'whale': return '🐋';
      case 'swap': return '💱';
      case 'rug': return '⚠️';
      case 'volume': return '📈';
      case 'new_token': return '🆕';
      case 'honeypot': return '🍯';
      default: return '🔔';
    }
  }

  // Get emoji for priority
  private getPriorityEmoji(priority: string): string {
    switch (priority) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return 'ℹ️';
      default: return '🔔';
    }
  }

  // Get color for Discord embed
  private getPriorityColor(priority: string): number {
    switch (priority) {
      case 'high': return 0xFF0000; // Red
      case 'medium': return 0xFFA500; // Orange
      case 'low': return 0x00FF00; // Green
      default: return 0x808080; // Gray
    }
  }

  // Update notification configuration
  updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Test notification channels
  async testChannels(): Promise<{ telegram: boolean; discord: boolean }> {
    const testAlert: AlertNotification = {
      id: 'test',
      type: 'whale',
      priority: 'medium',
      title: 'Test Alert',
      description: 'This is a test alert to verify notification channels are working.',
      timestamp: new Date()
    };

    const results = await Promise.allSettled([
      this.sendToTelegram(testAlert),
      this.sendToDiscord(testAlert)
    ]);

    return {
      telegram: results[0].status === 'fulfilled',
      discord: results[1].status === 'fulfilled'
    };
  }
} 