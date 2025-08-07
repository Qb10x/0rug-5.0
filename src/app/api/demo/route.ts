import { NextRequest, NextResponse } from 'next/server';
import { executeToolsForIntent } from '@/lib/api/aiToolExecutor';

// In-memory demo tracking (in production, use Redis or database)
const demoSessions = new Map<string, { count: number; lastReset: number }>();

// Demo session management
function getDemoSession(sessionId: string) {
  const now = Date.now();
  const session = demoSessions.get(sessionId);
  
  // Reset demo count if it's been more than 24 hours
  if (!session || (now - session.lastReset) > 24 * 60 * 60 * 1000) {
    demoSessions.set(sessionId, { count: 0, lastReset: now });
    return { count: 0, lastReset: now };
  }
  
  return session;
}

function incrementDemoCount(sessionId: string) {
  const session = getDemoSession(sessionId);
  session.count++;
  demoSessions.set(sessionId, session);
  return session.count;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Check demo limit
    const demoCount = getDemoSession(sessionId).count;
    if (demoCount >= 3) {
      return NextResponse.json({
        error: 'Demo limit reached',
        message: 'You have reached the demo limit. Please sign up for unlimited access!',
        demoComplete: true
      });
    }

    // Increment demo count
    const newCount = incrementDemoCount(sessionId);

    // Use the real AI tool executor
    const result = await executeToolsForIntent(message);

    if (!result || !result.response) {
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      response: result.response,
      success: true,
      demoCount: newCount,
      remainingQueries: Math.max(0, 3 - newCount)
    });

  } catch (error) {
    console.error('Demo API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check demo status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = getDemoSession(sessionId);
    
    return NextResponse.json({
      demoCount: session.count,
      remainingQueries: Math.max(0, 3 - session.count),
      lastReset: session.lastReset
    });

  } catch (error) {
    console.error('Demo status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 