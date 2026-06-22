import { getSolBalance, getTokenBalance } from '@/lib/solana';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet');
  const mint = req.nextUrl.searchParams.get('mint');

  if (!wallet) {
    return NextResponse.json({ error: 'Missing wallet' }, { status: 400 });
  }

  try {
    const solBalance = await getSolBalance(wallet);
    const tokenBalance = mint ? await getTokenBalance(wallet, mint) : null;

    return NextResponse.json({ solBalance, tokenBalance });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch balances';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
