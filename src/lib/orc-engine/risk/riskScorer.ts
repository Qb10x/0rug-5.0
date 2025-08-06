// ORC Risk Scorer - following 0rug.com coding guidelines

import { PublicKey, Connection } from '@solana/web3.js';
import { createORCConnection, executeORCOperation } from '../shared/solana';
import { RiskScore } from '../shared/types';
import { ORC_CONNECTION_CONFIG } from '../shared/orcConstants';

// Calculate LP risk score for a pool
export async function calculateLPRiskScore(poolAddress: string): Promise<RiskScore> {
  return executeORCOperation(async () => {
    const connection = await createORCConnection();
    return await analyzePoolRisk(connection, poolAddress);
  });
}

// Analyze pool risk using ORC data
async function analyzePoolRisk(connection: Connection, poolAddress: string): Promise<RiskScore> {
  try {
    const publicKey = new PublicKey(poolAddress);
    
    // Get pool account info
    const accountInfo = await connection.getAccountInfo(publicKey);
    
    if (!accountInfo) {
      return {
        riskScore: 100,
        riskLevel: 'danger',
        riskFactors: ['Pool account not found'],
        recommendations: ['Avoid this pool - account does not exist']
      };
    }

    // Get recent transactions for this pool
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 50 });
    
    // Analyze transaction patterns
    const riskFactors: string[] = [];
    const recommendations: string[] = [];
    
    // Check for suspicious patterns
    if (signatures.length < 5) {
      riskFactors.push('Low transaction volume');
      recommendations.push('Pool may be inactive or fake');
    }
    
    if (signatures.length > 1000) {
      riskFactors.push('Very high transaction volume');
      recommendations.push('Potential wash trading detected');
    }

    // Calculate risk score based on factors
    let riskScore = 50; // Base score
    
    if (riskFactors.includes('Low transaction volume')) riskScore += 30;
    if (riskFactors.includes('Very high transaction volume')) riskScore += 20;
    
    // Determine risk level
    let riskLevel: 'safe' | 'warning' | 'danger';
    if (riskScore < 30) riskLevel = 'safe';
    else if (riskScore < 70) riskLevel = 'warning';
    else riskLevel = 'danger';

    return {
      riskScore,
      riskLevel,
      riskFactors,
      recommendations
    };
  } catch (error) {
    console.error('Error analyzing pool risk:', error);
    return {
      riskScore: 100,
      riskLevel: 'danger',
      riskFactors: ['Error analyzing pool'],
      recommendations: ['Unable to analyze - proceed with caution']
    };
  }
}

// Calculate risk score for multiple pools
export async function calculateBatchRiskScores(poolAddresses: string[]): Promise<RiskScore[]> {
  const riskScores: RiskScore[] = [];
  
  for (const poolAddress of poolAddresses) {
    try {
      const riskScore = await calculateLPRiskScore(poolAddress);
      riskScores.push(riskScore);
    } catch (error) {
      console.error(`Error calculating risk for pool ${poolAddress}:`, error);
      riskScores.push({
        riskScore: 100,
        riskLevel: 'danger',
        riskFactors: ['Calculation failed'],
        recommendations: ['Unable to analyze this pool']
      });
    }
  }
  
  return riskScores;
} 