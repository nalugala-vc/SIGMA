'use client';

import {
  formatShortAddress,
  formatTokenAmount,
} from '@/lib/format';
import { useEffect, useState } from 'react';

type Holder = {
  rank: number;
  owner: string;
  amount: number;
  percent: number;
};

export default function HoldersList({
  mint,
  embedded = false,
}: {
  mint: string;
  embedded?: boolean;
}) {
  const [holders, setHolders] = useState<Holder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/token/${mint}/holders`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load holders');
        if (!cancelled) setHolders(data.holders);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load holders');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [mint]);

  const content = (
    <>
      {!embedded && (
        <p className="mb-3 text-xs text-zinc-500">
          Reads on-chain token accounts via Alchemy RPC. Top wallets only.
        </p>
      )}

      {loading && (
        <p className="py-6 text-center text-sm text-zinc-500">Loading holders…</p>
      )}

      {error && (
        <p className="py-6 text-center text-sm text-red-400">{error}</p>
      )}

      {!loading && !error && holders.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Wallet</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {holders.map((holder) => (
                <tr
                  key={holder.owner}
                  className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-900/60"
                >
                  <td className="px-3 py-2 text-zinc-500">{holder.rank}</td>
                  <td className="px-3 py-2">
                    <a
                      href={`https://solscan.io/account/${holder.owner}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-zinc-300 hover:text-sigma"
                    >
                      {formatShortAddress(holder.owner)}
                    </a>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-zinc-300">
                    {formatTokenAmount(holder.amount)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-zinc-400">
                    {holder.percent.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  if (embedded) return content;

  return (
    <section className="rounded-xl border border-zinc-800 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Top holders</h2>
        <p className="text-xs text-zinc-500">via Solana RPC · top 20</p>
      </div>
      {content}
    </section>
  );
}
