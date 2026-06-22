'use client';

import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

type Trade = {
  id: string;
  token_mint: string;
  side: 'buy' | 'sell';
  amount_in: string | null;
  amount_out: string | null;
  tx_signature: string | null;
  created_at: string;
};

type Profile = {
  email: string | null;
  wallet_address: string | null;
  created_at: string;
};

function formatTradeDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function ProfilePage() {
  const { ready, authenticated, user, login } = usePrivy();
  const { wallet } = useSolanaWallet();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivity = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/trades?privyUserId=${encodeURIComponent(user.id)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load activity');
      setProfile(data.profile);
      setTrades(data.trades);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (authenticated && user) loadActivity();
  }, [authenticated, user, loadActivity]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-black px-4 text-white">
        <p className="text-zinc-400">Sign in to view your profile and activity.</p>
        <button
          onClick={login}
          className="rounded-full bg-lime-400 px-6 py-3 font-bold text-black"
        >
          Sign in
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 bg-black px-4 py-8 text-white">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          ← Back to trending
        </Link>
        <button
          type="button"
          onClick={loadActivity}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900"
        >
          Refresh
        </button>
      </div>

      <header>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {user?.email?.address || user?.google?.email || 'Connected wallet'}
        </p>
      </header>

      <section className="rounded-xl border border-zinc-800 p-4">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
          Account
        </h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Wallet</dt>
            <dd className="truncate font-mono text-xs text-zinc-300">
              {wallet?.address || profile?.wallet_address || '—'}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Member since</dt>
            <dd className="text-zinc-300">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : '—'}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Total trades</dt>
            <dd className="text-zinc-300">{trades.length}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Activity history</h2>

        {loading && (
          <p className="py-8 text-center text-sm text-zinc-500">Loading trades…</p>
        )}

        {error && (
          <p className="py-8 text-center text-sm text-red-400">{error}</p>
        )}

        {!loading && !error && trades.length === 0 && (
          <p className="rounded-xl border border-zinc-800 py-8 text-center text-sm text-zinc-500">
            No trades yet. Buy a token from the trending page to see activity here.
          </p>
        )}

        {!loading && trades.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-3 py-3">Time</th>
                  <th className="px-3 py-3">Side</th>
                  <th className="px-3 py-3">Token</th>
                  <th className="px-3 py-3 text-right">Tx</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr
                    key={trade.id}
                    className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-900/60"
                  >
                    <td className="px-3 py-3 text-zinc-400">
                      {formatTradeDate(trade.created_at)}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          trade.side === 'buy' ? 'text-lime-400' : 'text-red-400'
                        }
                      >
                        {trade.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/token/${trade.token_mint}`}
                        className="font-mono text-xs text-zinc-300 hover:text-white"
                      >
                        {trade.token_mint.slice(0, 4)}…
                        {trade.token_mint.slice(-4)}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {trade.tx_signature ? (
                        <a
                          href={`https://solscan.io/tx/${trade.tx_signature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lime-400 hover:underline"
                        >
                          View ↗
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
