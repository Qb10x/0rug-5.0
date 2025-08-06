// Dexscreener API Route - Backend proxy for token data
// Following 0rug.com coding guidelines

import { NextRequest, NextResponse } from 'next/server';

// Get trending Solana tokens
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tokenAddress = searchParams.get('token');

    if (action === 'trending') {
      // Get trending tokens using search endpoint
      const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=SOL', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `Dexscreener API Error: ${response.status}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      
      // Filter and limit to top 5 trending Solana tokens
      const trendingTokens = data.pairs
        ?.filter((pair: any) => 
          pair.chainId === 'solana' &&
          pair.volume?.h24 > 10000 && // Minimum volume
          pair.liquidity?.usd > 50000 // Minimum liquidity
        )
        ?.slice(0, 5) || [];

      return NextResponse.json({ 
        success: true, 
        tokens: trendingTokens,
        timestamp: Date.now()
      });

    } else if (action === 'token' && tokenAddress) {
      // Get specific token data using token-pairs endpoint
      const response = await fetch(`https://api.dexscreener.com/token-pairs/v1/solana/${tokenAddress}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `Token not found or API error: ${response.status}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        return NextResponse.json(
          { error: 'Token not found on Dexscreener' },
          { status: 404 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        token: data[0],
        timestamp: Date.now()
      });

    } else if (action === 'search' && searchParams.get('q')) {
      // Search for tokens
      const query = searchParams.get('q');
      const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query!)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `Dexscreener search error: ${response.status}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      
      // Filter for Solana pairs
      const solanaPairs = data.pairs?.filter((pair: any) => pair.chainId === 'solana') || [];

      return NextResponse.json({ 
        success: true, 
        pairs: solanaPairs,
        timestamp: Date.now()
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use ?action=trending, ?action=token&token=ADDRESS, or ?action=search&q=QUERY' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Dexscreener API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 