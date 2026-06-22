import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { privyUserId, tokenMint, side, amountIn, amountOut, txSignature } =
    await req.json();

  if (!privyUserId || !tokenMint || !side || !txSignature) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (side !== 'buy' && side !== 'sell') {
    return NextResponse.json({ error: 'Invalid side' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('privy_user_id', privyUserId)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: 'User profile not found. Try logging out and back in.' },
      { status: 404 }
    );
  }

  const { data, error } = await supabase
    .from('trades')
    .insert({
      user_id: profile.id,
      token_mint: tokenMint,
      side,
      amount_in: amountIn ?? null,
      amount_out: amountOut ?? null,
      tx_signature: txSignature,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ trade: data });
}
