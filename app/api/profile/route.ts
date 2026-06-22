import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const PROFILE_FIELDS =
  'id, email, wallet_address, avatar_url, created_at, updated_at';

export async function GET(req: NextRequest) {
  const privyUserId = req.nextUrl.searchParams.get('privyUserId');

  if (!privyUserId) {
    return NextResponse.json({ error: 'Missing privyUserId' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('privy_user_id', privyUserId)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json({ profile });
}
