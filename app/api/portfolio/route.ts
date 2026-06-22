import { computePortfolio } from '@/lib/portfolio';
import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const SNAPSHOT_MIN_INTERVAL_MS = 5 * 60 * 1000;

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet');
  const privyUserId = req.nextUrl.searchParams.get('privyUserId');

  if (!wallet) {
    return NextResponse.json({ error: 'Missing wallet' }, { status: 400 });
  }

  try {
    const portfolio = await computePortfolio(wallet);
    const snapshots = await loadSnapshots(privyUserId, portfolio);
    return NextResponse.json({ portfolio, snapshots });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to compute portfolio';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function loadSnapshots(
  privyUserId: string | null,
  portfolio: Awaited<ReturnType<typeof computePortfolio>>
) {
  if (!privyUserId) return [];

  const supabase = createServerClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('privy_user_id', privyUserId)
    .single();

  if (!profile) return [];

  const { data: latest } = await supabase
    .from('portfolio_snapshots')
    .select('recorded_at, total_usd')
    .eq('user_id', profile.id)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const shouldSave =
    !latest ||
    Date.now() - new Date(latest.recorded_at).getTime() > SNAPSHOT_MIN_INTERVAL_MS ||
    Math.abs(latest.total_usd - portfolio.totalUsd) > 0.01;

  if (shouldSave) {
    await supabase.from('portfolio_snapshots').insert({
      user_id: profile.id,
      total_usd: portfolio.totalUsd,
      sol_usd: portfolio.solUsd,
      tokens_usd: portfolio.tokensUsd,
    });
  }

  const { data: snapshots } = await supabase
    .from('portfolio_snapshots')
    .select('total_usd, sol_usd, tokens_usd, recorded_at')
    .eq('user_id', profile.id)
    .order('recorded_at', { ascending: true })
    .limit(60);

  return snapshots ?? [];
}
