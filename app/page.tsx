'use client';

import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export default function Home() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  useEffect(() => {
    if (authenticated && user) {
      fetch('/api/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privyUserId: user.id,
          email: user.email?.address || user.google?.email,
          walletAddress: user.wallet?.address,
        }),
      });
    }
  }, [authenticated, user]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-black text-white">
      <h1 className="text-3xl font-bold">SIGMA</h1>

      {authenticated ? (
        <>
          <p>Logged in as: {user?.email?.address || user?.google?.email}</p>
          <p className="text-sm text-gray-400">
            Wallet: {user?.wallet?.address || 'creating wallet...'}
          </p>
          <button
            onClick={logout}
            className="rounded bg-red-500 px-4 py-2 font-bold"
          >
            Log out
          </button>
        </>
      ) : (
        <button
          onClick={login}
          className="rounded bg-lime-400 px-6 py-3 font-bold text-black"
        >
          Sign in
        </button>
      )}
    </main>
  );
}