'use client';

import { useCallback, useEffect, useState } from 'react';

export type UserProfile = {
  id: string;
  email: string | null;
  wallet_address: string | null;
  avatar_url: string | null;
  created_at: string;
};

export function useUserProfile(privyUserId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!privyUserId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/profile?privyUserId=${encodeURIComponent(privyUserId)}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setProfile(data.profile ?? null);
    } finally {
      setLoading(false);
    }
  }, [privyUserId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, avatarUrl: profile?.avatar_url ?? null, loading, refresh };
}
