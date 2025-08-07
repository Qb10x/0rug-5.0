import { executeToolsForIntent } from '@/lib/api/aiToolExecutor';
import { getTokenMetadata } from '@/lib/api/tokenRegistry';
import { NotificationService } from './notificationService';

interface AlertTrigger {
  id: string;
  type: 'whale' | 'swap' | 'rug' | 'volume' | 'new_token' | 'honeypot';
  priority: 'high' | 'medium' | 'low';
  tokenAddress?: string;
  walletAddress?: string;
  amount?: string;
  description: string;
  timestamp: Date;
  channels: string[];
  isRead: boolean;
  isStarred: boolean;
}

interface AlertConfig {
  whaleThreshold: number; // Minimum amount for whale alerts
  volumeSpikeThreshold: number; // Minimum volume increase for alerts
  rugPullConfidence: number; // Minimum confidence for rug pull alerts
  enabledChannels: string[];
  autoAnalysis: boolean;
  notificationsEnabled: boolean;
}

// Alert engine that integrates with smart AI tools and notifications
export class AlertEngine {
  private config: AlertConfig;
  private activeAlerts: AlertTrigger[] = [];
  private notificationService: NotificationService;

  constructor(config: AlertConfig) {
    this.config = config;
    this.notificationService = new NotificationService({
      enabledChannels: config.enabledChannels,
      telegramBotToken: process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN,
      telegramChatId: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID,
      discordWebhookUrl: process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL
    });
  }

  // Monitor token for potential alerts using smart AI analysis
  async monitorToken(tokenAddress: string): Promise<AlertTrigger[]> {
    const alerts: AlertTrigger[] = [];
    
    try {
      // Get token metadata for context
      const tokenMeta = await getTokenMetadata(tokenAddress);
      
      // Run comprehensive analysis using smart AI tools
      const analysisResult = await executeToolsForIntent(
        `Analyze token ${tokenAddress} for potential alerts`,
        { enablePaidAPIs: true, personaEnabled: false }
      );

      if (analysisResult.success) {
        // Check for whale activity
        if (this.detectWhaleActivity(analysisResult.data)) {
          const alert = this.createWhaleAlert(tokenAddress, analysisResult.data);
          alerts.push(alert);
          await this.sendNotification(alert);
        }

        // Check for volume spikes
        if (this.detectVolumeSpike(analysisResult.data)) {
          const alert = this.createVolumeAlert(tokenAddress, analysisResult.data);
          alerts.push(alert);
          await this.sendNotification(alert);
        }

        // Check for rug pull indicators
        if (this.detectRugPull(analysisResult.data)) {
          const alert = this.createRugPullAlert(tokenAddress, analysisResult.data);
          alerts.push(alert);
          await this.sendNotification(alert);
        }

        // Check for new token launches
        if (this.detectNewToken(analysisResult.data)) {
          const alert = this.createNewTokenAlert(tokenAddress, analysisResult.data);
          alerts.push(alert);
          await this.sendNotification(alert);
        }

        // Check for honeypot indicators
        if (this.detectHoneypot(analysisResult.data)) {
          const alert = this.createHoneypotAlert(tokenAddress, analysisResult.data);
          alerts.push(alert);
          await this.sendNotification(alert);
        }
      }
    } catch (error) {
      console.error('Error monitoring token:', error);
    }

    return alerts;
  }

  // Send notification for alert
  private async sendNotification(alert: AlertTrigger): Promise<void> {
    if (!this.config.notificationsEnabled) return;

    try {
      const notification = {
        id: alert.id,
        type: alert.type,
        priority: alert.priority,
        title: this.getAlertTitle(alert.type),
        description: alert.description,
        tokenAddress: alert.tokenAddress,
        amount: alert.amount,
        timestamp: alert.timestamp
      };

      await this.notificationService.sendAlert(notification);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Get alert title based on type
  private getAlertTitle(type: string): string {
    switch (type) {
      case 'whale': return 'Whale Movement Detected';
      case 'swap': return 'Large Swap Detected';
      case 'rug': return 'Rug Pull Alert';
      case 'volume': return 'Volume Spike Detected';
      case 'new_token': return 'New Token Launched';
      case 'honeypot': return 'Honeypot Detected';
      default: return 'Alert';
    }
  }

  // Detect whale activity from analysis data
  private detectWhaleActivity(data: any): boolean {
    if (!data || !data.holderAnalysis) return false;
    
    const largeHolders = data.holderAnalysis.topHolders || [];
    const whaleThreshold = this.config.whaleThreshold;
    
    return largeHolders.some((holder: any) => 
      holder.percentage > 5 || holder.amount > whaleThreshold
    );
  }

  // Detect volume spikes from analysis data
  private detectVolumeSpike(data: any): boolean {
    if (!data || !data.volumeAnalysis) return false;
    
    const volumeChange = data.volumeAnalysis.change24h || 0;
    return volumeChange > this.config.volumeSpikeThreshold;
  }

  // Detect rug pull indicators from analysis data
  private detectRugPull(data: any): boolean {
    if (!data || !data.rugAnalysis) return false;
    
    const confidence = data.rugAnalysis.confidence || 0;
    return confidence > this.config.rugPullConfidence;
  }

  // Detect new token launches
  private detectNewToken(data: any): boolean {
    if (!data || !data.tokenAnalysis) return false;
    
    const tokenAge = data.tokenAnalysis.age || 0;
    return tokenAge < 24; // Less than 24 hours old
  }

  // Detect honeypot indicators
  private detectHoneypot(data: any): boolean {
    if (!data || !data.honeypotAnalysis) return false;
    
    return data.honeypotAnalysis.isHoneypot === true;
  }

  // Create whale movement alert
  private createWhaleAlert(tokenAddress: string, data: any): AlertTrigger {
    const whaleData = data.holderAnalysis?.topHolders?.[0];
    
    return {
      id: `whale-${Date.now()}`,
      type: 'whale',
      priority: 'high',
      tokenAddress,
      walletAddress: whaleData?.address,
      amount: whaleData?.amount,
      description: `Large whale activity detected. ${whaleData?.percentage}% of supply moved by ${whaleData?.address?.slice(0, 8)}...`,
      timestamp: new Date(),
      channels: this.config.enabledChannels,
      isRead: false,
      isStarred: false
    };
  }

  // Create volume spike alert
  private createVolumeAlert(tokenAddress: string, data: any): AlertTrigger {
    const volumeData = data.volumeAnalysis;
    
    return {
      id: `volume-${Date.now()}`,
      type: 'volume',
      priority: 'medium',
      tokenAddress,
      amount: volumeData?.volume24h,
      description: `Volume spike detected! ${volumeData?.change24h}x increase in 24h volume.`,
      timestamp: new Date(),
      channels: this.config.enabledChannels,
      isRead: false,
      isStarred: false
    };
  }

  // Create rug pull alert
  private createRugPullAlert(tokenAddress: string, data: any): AlertTrigger {
    const rugData = data.rugAnalysis;
    
    return {
      id: `rug-${Date.now()}`,
      type: 'rug',
      priority: 'high',
      tokenAddress,
      description: `Rug pull detected! Confidence: ${rugData?.confidence}%. ${rugData?.reasons?.join(', ')}`,
      timestamp: new Date(),
      channels: this.config.enabledChannels,
      isRead: false,
      isStarred: false
    };
  }

  // Create new token alert
  private createNewTokenAlert(tokenAddress: string, data: any): AlertTrigger {
    const tokenData = data.tokenAnalysis;
    
    return {
      id: `new-${Date.now()}`,
      type: 'new_token',
      priority: 'medium',
      tokenAddress,
      description: `New token launched: ${tokenData?.name || 'Unknown'} (${tokenData?.symbol || 'Unknown'})`,
      timestamp: new Date(),
      channels: this.config.enabledChannels,
      isRead: false,
      isStarred: false
    };
  }

  // Create honeypot alert
  private createHoneypotAlert(tokenAddress: string, data: any): AlertTrigger {
    const honeypotData = data.honeypotAnalysis;
    
    return {
      id: `honeypot-${Date.now()}`,
      type: 'honeypot',
      priority: 'high',
      tokenAddress,
      description: `Honeypot detected! Token is not sellable. Risk factors: ${honeypotData?.riskFactors?.join(', ')}`,
      timestamp: new Date(),
      channels: this.config.enabledChannels,
      isRead: false,
      isStarred: false
    };
  }

  // Get all active alerts
  getActiveAlerts(): AlertTrigger[] {
    return this.activeAlerts;
  }

  // Add alert to active list
  addAlert(alert: AlertTrigger): void {
    this.activeAlerts.unshift(alert);
    // Keep only last 100 alerts
    if (this.activeAlerts.length > 100) {
      this.activeAlerts = this.activeAlerts.slice(0, 100);
    }
  }

  // Mark alert as read
  markAsRead(alertId: string): void {
    const alert = this.activeAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
    }
  }

  // Toggle star status
  toggleStar(alertId: string): void {
    const alert = this.activeAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.isStarred = !alert.isStarred;
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<AlertConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Test notification channels
  async testNotifications(): Promise<{ telegram: boolean; discord: boolean }> {
    return await this.notificationService.testChannels();
  }
} 