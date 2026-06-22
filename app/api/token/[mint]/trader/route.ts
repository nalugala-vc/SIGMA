import { fetchTraderStats } from '@/lib/trader-stats';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;
  const wallet = req.nextUrl.searchParams.get('wallet');
  const pair = req.nextUrl.searchParams.get('pair');

  if (!wallet) {
    return NextResponse.json({ error: 'Missing wallet' }, { status: 400 });
  }
  if (!pair) {
    return NextResponse.json({ error: 'Missing pair address' }, { status: 400 });
  }

  try {
    const stats = await fetchTraderStats(pair, mint, wallet);
    return NextResponse.json({ stats });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch trader stats';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
