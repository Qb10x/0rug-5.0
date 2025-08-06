// Jupiter API Integration - Free token data source
// Following 0rug.com coding guidelines

// Jupiter token data interface
interface JupiterTokenData {
  id: string;
  mintSymbol: string;
  vsToken: string;
  vsTokenSymbol: string;
  price: number;
  marketCap?: number;
  volume24h?: number;
  coingeckoId?: string;
}

// Jupiter API response interface
interface JupiterPriceResponse {
  data: Record<string, JupiterTokenData>;
  timeTaken: number;
}

// Get token price and market data from Jupiter
export async function getJupiterTokenData(tokenAddress: string): Promise<JupiterTokenData | null> {
  try {
    const response = await fetch(`https://price.jup.ag/v4/price?ids=${tokenAddress}`);
    
    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.status}`);
    }
    
    const data: JupiterPriceResponse = await response.json();
    return data.data[tokenAddress] || null;
  } catch {
    return null;
  }
}

// Get all available tokens from Jupiter
export async function getJupiterTokenList(): Promise<JupiterTokenData[]> {
  try {
    const response = await fetch('https://token.jup.ag/all');
    
    if (!response.ok) {
      throw new Error(`Jupiter token list error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.tokens || [];
  } catch {
    return [];
  }
}

// Get token metadata from Jupiter
export async function getJupiterTokenMetadata(tokenAddress: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(`https://token.jup.ag/token/${tokenAddress}`);
    
    if (!response.ok) {
      throw new Error(`Jupiter metadata error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch {
    return null;
  }
}

// Get token quotes from Jupiter
export async function getJupiterQuote(
  inputMint: string,
  outputMint: string,
  amount: number
): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`
    );
    
    if (!response.ok) {
      throw new Error(`Jupiter quote error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch {
    return null;
  }
} 