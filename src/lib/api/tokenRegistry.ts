// Token Registry Integration - Free token metadata resolution
// Following 0rug.com coding guidelines

interface TokenMetadata {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  tags: string[];
  verified: boolean;
  chainId: number;
}

interface TokenListResponse {
  name: string;
  logoURI: string;
  keywords: string[];
  tags: Record<string, TokenTag>;
  timestamp: string;
  tokens: TokenMetadata[];
}

interface TokenTag {
  name: string;
  description: string;
}

// Cache for token metadata to reduce API calls
const tokenCache = new Map<string, TokenMetadata>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Get Jupiter token list (primary source)
export async function getJupiterTokenList(): Promise<TokenMetadata[]> {
  try {
    const response = await fetch('https://token.jup.ag/all');
    
    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.status}`);
    }

    const data: TokenListResponse = await response.json();
    
    // Check if data.tokens exists and is an array
    if (!data.tokens || !Array.isArray(data.tokens)) {
      console.warn('Jupiter API returned unexpected data structure:', data);
      return [];
    }
    
    // Cache the tokens
    data.tokens.forEach(token => {
      tokenCache.set(token.address, {
        ...token,
        timestamp: Date.now()
      } as TokenMetadata & { timestamp: number });
    });

    return data.tokens;
  } catch (error) {
    console.error('Jupiter token list error:', error);
    return [];
  }
}

// Get Raydium token list (backup source)
export async function getRaydiumTokenList(): Promise<TokenMetadata[]> {
  try {
    const response = await fetch('https://api.raydium.io/v2/sdk/token/raydium.mainnet.json');
    
    if (!response.ok) {
      throw new Error(`Raydium API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Raydium format to our format
    const tokens: TokenMetadata[] = data.official.map((token: any) => ({
      address: token.mint,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      logoURI: token.logoURI,
      tags: token.tags || [],
      verified: true,
      chainId: 101 // Solana mainnet
    }));

    // Cache the tokens
    tokens.forEach(token => {
      tokenCache.set(token.address, {
        ...token,
        timestamp: Date.now()
      } as TokenMetadata & { timestamp: number });
    });

    return tokens;
  } catch (error) {
    console.error('Raydium token list error:', error);
    return [];
  }
}

// Get token metadata by address with fallback strategy
export async function getTokenMetadata(address: string): Promise<TokenMetadata | null> {
  // Check cache first
  const cached = tokenCache.get(address);
  if (cached && Date.now() - (cached as any).timestamp < CACHE_DURATION) {
    return cached;
  }

  try {
    // Try Jupiter first (most comprehensive)
    const jupiterTokens = await getJupiterTokenList();
    const jupiterToken = jupiterTokens.find(t => t.address === address);
    
    if (jupiterToken) {
      return jupiterToken;
    }

    // Try Raydium as fallback
    const raydiumTokens = await getRaydiumTokenList();
    const raydiumToken = raydiumTokens.find(t => t.address === address);
    
    if (raydiumToken) {
      return raydiumToken;
    }

    return null;
  } catch (error) {
    console.error('Token metadata resolution error:', error);
    return null;
  }
}

// Get token personality for AI responses
export async function getTokenPersonality(address: string): Promise<{
  name: string;
  symbol: string;
  description: string;
  personality: string;
} | null> {
  const metadata = await getTokenMetadata(address);
  
  if (!metadata) {
    return null;
  }

  // Generate personality based on token data
  let personality = 'friendly';
  let description = '';

  if (metadata.tags.includes('meme')) {
    personality = 'funny';
    description = 'a meme token with a sense of humor';
  } else if (metadata.tags.includes('defi')) {
    personality = 'professional';
    description = 'a DeFi protocol token';
  } else if (metadata.tags.includes('nft')) {
    personality = 'artistic';
    description = 'an NFT-related token';
  } else {
    personality = 'helpful';
    description = 'a Solana token';
  }

  return {
    name: metadata.name,
    symbol: metadata.symbol,
    description,
    personality
  };
}

// Get LP pool information from Raydium
export async function getRaydiumPairs(): Promise<Array<{
  id: string;
  baseMint: string;
  quoteMint: string;
  lpMint: string;
  baseDecimals: number;
  quoteDecimals: number;
  lpDecimals: number;
  version: number;
  programId: string;
  authority: string;
  openOrders: string;
  targetOrders: string;
  baseVault: string;
  quoteVault: string;
  withdrawQueue: string;
  lpVault: string;
  marketVersion: number;
  marketProgramId: string;
  marketId: string;
  marketAuthority: string;
  marketBaseVault: string;
  marketQuoteVault: string;
  marketBids: string;
  marketAsks: string;
  marketEventQueue: string;
}>> {
  try {
    const response = await fetch('https://api.raydium.io/v2/sdk/liquidity/mainnet.json');
    
    if (!response.ok) {
      throw new Error(`Raydium pairs API error: ${response.status}`);
    }

    const data = await response.json();
    return data.official || [];
  } catch (error) {
    console.error('Raydium pairs error:', error);
    return [];
  }
}

// Find LP pool for a token
export async function findLPPool(tokenAddress: string): Promise<{
  poolAddress: string;
  baseToken: string;
  quoteToken: string;
  liquidity: number;
} | null> {
  try {
    const pairs = await getRaydiumPairs();
    
    // Find pools containing the token
    const pools = pairs.filter(pair => 
      pair.baseMint === tokenAddress || pair.quoteMint === tokenAddress
    );

    if (pools.length === 0) {
      return null;
    }

    // Return the pool with highest liquidity (first one for now)
    const pool = pools[0];
    
    return {
      poolAddress: pool.id,
      baseToken: pool.baseMint,
      quoteToken: pool.quoteMint,
      liquidity: 0 // Would need additional API call to get actual liquidity
    };
  } catch (error) {
    console.error('LP pool finder error:', error);
    return null;
  }
}

// Smart token resolution with fallback strategy
export async function resolveTokenWithFallback(address: string): Promise<{
  metadata: TokenMetadata | null;
  lpPool: any | null;
  source: 'jupiter' | 'raydium' | 'dexscreeener' | 'moralis' | 'helius';
} | null> {
  try {
    // 1. Try Jupiter token list (FREE)
    const jupiterTokens = await getJupiterTokenList();
    const jupiterToken = jupiterTokens.find(t => t.address === address);
    
    if (jupiterToken) {
      const lpPool = await findLPPool(address);
      return {
        metadata: jupiterToken,
        lpPool,
        source: 'jupiter'
      };
    }

    // 2. Try Raydium token list (FREE)
    const raydiumTokens = await getRaydiumTokenList();
    const raydiumToken = raydiumTokens.find(t => t.address === address);
    
    if (raydiumToken) {
      const lpPool = await findLPPool(address);
      return {
        metadata: raydiumToken,
        lpPool,
        source: 'raydium'
      };
    }

    // 3. Try DexScreener (FREE)
    try {
      const dexScreenerResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
      if (dexScreenerResponse.ok) {
        const dexData = await dexScreenerResponse.json();
        if (dexData.pairs && dexData.pairs.length > 0) {
          const pair = dexData.pairs[0];
          return {
            metadata: {
              address,
              name: pair.baseToken.name,
              symbol: pair.baseToken.symbol,
              decimals: pair.baseToken.decimals,
              logoURI: pair.baseToken.logoURI,
              tags: [],
              verified: false,
              chainId: 101
            },
            lpPool: null,
            source: 'dexscreeener'
          };
        }
      }
    } catch {
      // Continue to next fallback
    }

    // 4. Try Moralis (PAID) - only if other sources fail
    try {
      const { getMoralisTokenMetadata } = await import('./moralis');
      const moralisToken = await getMoralisTokenMetadata(address);
      
      if (moralisToken) {
        return {
          metadata: {
            address: moralisToken.address,
            name: moralisToken.name,
            symbol: moralisToken.symbol,
            decimals: moralisToken.decimals,
            logoURI: moralisToken.logoURI,
            tags: moralisToken.tags,
            verified: moralisToken.verified,
            chainId: 101
          },
          lpPool: null,
          source: 'moralis'
        };
      }
    } catch {
      // Continue to next fallback
    }

    // 5. Try Helius (PAID) - last resort
    try {
      const { getHeliusWalletActivity } = await import('./helius');
      // Note: Helius doesn't have direct token metadata, but we can use it for additional data
      return {
        metadata: null,
        lpPool: null,
        source: 'helius'
      };
    } catch {
      // All sources failed
    }

    return null;
  } catch (error) {
    console.error('Token resolution error:', error);
    return null;
  }
}

// Generate AI persona response for token
export async function generateTokenPersonaResponse(address: string): Promise<string | null> {
  const resolution = await resolveTokenWithFallback(address);
  
  if (!resolution || !resolution.metadata) {
    return null;
  }

  const { metadata, source } = resolution;
  
  // Generate personalized response based on token data
  if (metadata.tags.includes('meme')) {
    return `Hey, I'm **${metadata.symbol}** – a meme token with a sense of humor! 🚀 How can I help you analyze my performance today?`;
  } else if (metadata.tags.includes('defi')) {
    return `Hello, I'm **${metadata.symbol}** – a DeFi protocol token. Let me help you understand my metrics and performance.`;
  } else if (metadata.tags.includes('nft')) {
    return `Hi there! I'm **${metadata.symbol}** – an NFT-related token. Ready to explore my data and insights?`;
  } else {
    return `Hey! I'm **${metadata.symbol}** – a Solana token. What would you like to know about me?`;
  }
} 