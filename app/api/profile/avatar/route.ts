import { uploadAvatar } from '@/lib/r2';
import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const privyUserId = formData.get('privyUserId');

    if (!privyUserId || typeof privyUserId !== 'string') {
      return NextResponse.json({ error: 'Missing privyUserId' }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing image file' }, { status: 400 });
    }

    const avatarUrl = await uploadAvatar(privyUserId, file);

    const supabase = createServerClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('privy_user_id', privyUserId)
      .select('id, email, wallet_address, avatar_url, created_at, updated_at')
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: error?.message ?? 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile, avatarUrl });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to upload avatar';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
