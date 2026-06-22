import { fetchTopHolders } from '@/lib/holders';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;

  try {
    const holders = await fetchTopHolders(mint);
    return NextResponse.json({ holders, source: 'solana-rpc' });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch holders';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
