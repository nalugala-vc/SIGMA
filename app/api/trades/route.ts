import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const privyUserId = req.nextUrl.searchParams.get('privyUserId');

  if (!privyUserId) {
    return NextResponse.json({ error: 'Missing privyUserId' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, wallet_address, created_at')
    .eq('privy_user_id', privyUserId)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const { data: trades, error: tradesError } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (tradesError) {
    return NextResponse.json({ error: tradesError.message }, { status: 500 });
  }

  return NextResponse.json({ profile, trades: trades ?? [] });
}
