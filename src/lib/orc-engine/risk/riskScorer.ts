// ORC Risk Scorer - following 0rug.com coding guidelines

import { PublicKey, Connection } from '@solana/web3.js';
import { createORCConnection, executeORCOperation } from '../shared/solana';
import { RiskScore } from '../shared/types';

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
    const accountInfo = await connection.getAccountInfo(publicKey);
    
    if (!accountInfo) {
      return createHighRiskScore('Pool account not found', 'Avoid this pool - account does not exist');
    }

    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 50 });
    const riskAnalysis = analyzeTransactionPatterns(signatures);
    
    return calculateRiskScore(riskAnalysis);
  } catch {
    return createHighRiskScore('Error analyzing pool', 'Unable to analyze - proceed with caution');
  }
}

// Analyze transaction patterns for risk factors
function analyzeTransactionPatterns(signatures: Array<{ signature: string }>): {
  riskFactors: string[];
  recommendations: string[];
} {
  const riskFactors: string[] = [];
  const recommendations: string[] = [];
  
  if (signatures.length < 5) {
    riskFactors.push('Low transaction volume');
    recommendations.push('Pool may be inactive or fake');
  }
  
  if (signatures.length > 1000) {
    riskFactors.push('Very high transaction volume');
    recommendations.push('Potential wash trading detected');
  }

  return { riskFactors, recommendations };
}

// Calculate risk score based on factors
function calculateRiskScore(analysis: {
  riskFactors: string[];
  recommendations: string[];
}): RiskScore {
  let riskScore = 50; // Base score
  
  if (analysis.riskFactors.includes('Low transaction volume')) {
    riskScore += 30;
  }
  
  if (analysis.riskFactors.includes('Very high transaction volume')) {
    riskScore += 20;
  }
  
  const riskLevel = determineRiskLevel(riskScore);

  return {
    riskScore,
    riskLevel,
    riskFactors: analysis.riskFactors,
    recommendations: analysis.recommendations
  };
}

// Determine risk level based on score
function determineRiskLevel(riskScore: number): 'safe' | 'warning' | 'danger' {
  if (riskScore < 30) return 'safe';
  if (riskScore < 70) return 'warning';
  return 'danger';
}

// Create high risk score for errors
function createHighRiskScore(factor: string, recommendation: string): RiskScore {
  return {
    riskScore: 100,
    riskLevel: 'danger',
    riskFactors: [factor],
    recommendations: [recommendation]
  };
}

// Calculate risk score for multiple pools
export async function calculateBatchRiskScores(poolAddresses: string[]): Promise<RiskScore[]> {
  const riskScores: RiskScore[] = [];
  
  for (const poolAddress of poolAddresses) {
    try {
      const riskScore = await calculateLPRiskScore(poolAddress);
      riskScores.push(riskScore);
    } catch {
      riskScores.push(createHighRiskScore('Calculation failed', 'Unable to analyze this pool'));
    }
  }
  
  return riskScores;
} 