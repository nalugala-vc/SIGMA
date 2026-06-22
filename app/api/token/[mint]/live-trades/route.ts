import { fetchPoolTrades } from '@/lib/geckoterminal';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;
  const pairAddress = req.nextUrl.searchParams.get('pair');

  if (!pairAddress) {
    return NextResponse.json({ error: 'Missing pair address' }, { status: 400 });
  }

  try {
    const trades = await fetchPoolTrades(pairAddress, mint);
    return NextResponse.json({ trades, source: 'geckoterminal' });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch live trades';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
