'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp,
  RefreshCw,
  Search,
  Eye,
  BarChart3
} from 'lucide-react';
import { calculateLPRiskScore } from '@/lib/orc-engine/risk/riskScorer';

// Risk interface
interface RiskAssessment {
  poolAddress: string;
  tokenA: string;
  tokenB: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  recommendations: string[];
  lastUpdated: string;
}

export default function RiskPage() {
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load risk data
  const loadRisks = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockRisks: RiskAssessment[] = [
        {
          poolAddress: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
          tokenA: 'USDC',
          tokenB: 'SOL',
          riskScore: 85,
          riskLevel: 'low',
          riskFactors: ['High liquidity', 'Stable volume', 'Low volatility'],
          recommendations: ['Safe for trading', 'Monitor for changes'],
          lastUpdated: '2025-01-05T10:30:00Z'
        },
        {
          poolAddress: '8HoQnePLqP9oTw8P7WY5J9oMLq1WzoHjJmrbvWcrTkz',
          tokenA: 'RAY',
          tokenB: 'USDC',
          riskScore: 65,
          riskLevel: 'medium',
          riskFactors: ['Moderate liquidity', 'Some volatility', 'Recent activity'],
          recommendations: ['Exercise caution', 'Monitor closely'],
          lastUpdated: '2025-01-05T09:15:00Z'
        },
        {
          poolAddress: '2QK9vxydd7oDwvKJ6FK5UqGqyNqRF6JMC6oSVR9rJ3rL',
          tokenA: 'BONK',
          tokenB: 'SOL',
          riskScore: 35,
          riskLevel: 'high',
          riskFactors: ['Low liquidity', 'High volatility', 'Suspicious activity'],
          recommendations: ['Avoid trading', 'High risk of loss'],
          lastUpdated: '2025-01-05T08:45:00Z'
        }
      ];
      
      setRisks(mockRisks);
    } catch (error) {
      console.error('Error loading risks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRisks();
  }, []);

  const filteredRisks = risks.filter(risk => 
    risk.tokenA.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risk.tokenB.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risk.poolAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-primary bg-primary/20';
      case 'medium': return 'text-accent bg-accent/20';
      case 'high': return 'text-destructive bg-destructive/20';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Risk Score</h1>
              <p className="text-muted-foreground">Advanced risk assessment for liquidity pools</p>
            </div>
            <button
              onClick={loadRisks}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50 text-primary-foreground rounded-xl font-semibold transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Analyzing...' : 'Analyze Risk'}</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search pools by token or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors duration-200"
            />
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Pools', value: risks.length, icon: Shield },
            { label: 'Low Risk', value: risks.filter(r => r.riskLevel === 'low').length, icon: TrendingUp },
            { label: 'High Risk', value: risks.filter(r => r.riskLevel === 'high').length, icon: AlertTriangle },
            { label: 'Avg Score', value: `${Math.round(risks.reduce((sum, r) => sum + r.riskScore, 0) / risks.length)}/100`, icon: BarChart3 }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center mb-4">
                <stat.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Risk List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-card backdrop-blur-sm rounded-2xl border border-border overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Risk Assessments</h2>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 text-foreground animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Analyzing pool risks...</p>
            </div>
          ) : filteredRisks.length === 0 ? (
            <div className="p-8 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pools found matching your criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredRisks.map((risk, index) => (
                <motion.div
                  key={risk.poolAddress}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="p-6 hover:bg-muted transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {risk.tokenA} / {risk.tokenB}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(risk.riskLevel)}`}>
                          {risk.riskLevel.toUpperCase()} RISK
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Score: {risk.riskScore}/100
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Address: {risk.poolAddress.slice(0, 8)}...{risk.poolAddress.slice(-8)}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Risk Factors:</span>
                          <ul className="list-disc list-inside text-foreground mt-1">
                            {risk.riskFactors.map((factor, i) => (
                              <li key={i}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Recommendations:</span>
                                                      <ul className="list-disc list-inside text-foreground mt-1">
                              {risk.recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors duration-200">
                        <Eye className="w-4 h-4" />
                      </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
} 