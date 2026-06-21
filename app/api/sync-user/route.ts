import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { privyUserId, email, walletAddress } = await req.json();

  if (!privyUserId) {
    return NextResponse.json({ error: 'Missing privyUserId' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { privy_user_id: privyUserId, email, wallet_address: walletAddress },
      { onConflict: 'privy_user_id' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}