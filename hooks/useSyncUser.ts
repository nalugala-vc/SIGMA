'use client';

import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';

/** Upserts the logged-in user into Supabase (any login method including external wallet). */
export function useSyncUser() {
  const { authenticated, user } = usePrivy();
  const { wallet } = useSolanaWallet();

  useEffect(() => {
    if (!authenticated || !user?.id || !wallet?.address) return;

    fetch('/api/sync-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        privyUserId: user.id,
        email: user.email?.address || user.google?.email || null,
        walletAddress: wallet.address,
      }),
    }).catch(() => {
      // Non-blocking — profile sync retries on next visit
    });
  }, [authenticated, user, wallet?.address]);
}
