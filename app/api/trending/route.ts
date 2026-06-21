import { fetchTrendingSolanaTokens } from '@/lib/dexscreener';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10) || 20)
  );

  try {
    const result = await fetchTrendingSolanaTokens(page, limit);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch trending tokens';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
