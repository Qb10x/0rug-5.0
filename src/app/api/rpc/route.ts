// Solana RPC API Route - Backend proxy to avoid CORS
// Following 0rug.com coding guidelines

import { NextRequest, NextResponse } from 'next/server';

// Handle POST requests to Solana RPC
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Use Helius RPC endpoint (free, no auth required)
    const response = await fetch('https://mainnet.helius-rpc.com/?api-key=e7dacc4a-c752-4548-ae64-2aa8f785ff13', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `RPC Error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests for health check
export async function GET() {
  try {
    const response = await fetch('https://mainnet.helius-rpc.com/?api-key=e7dacc4a-c752-4548-ae64-2aa8f785ff13', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSlot'
      })
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `RPC Health Check Failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ 
      status: 'healthy',
      slot: data.result 
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'RPC Health Check Failed' },
      { status: 500 }
    );
  }
} 