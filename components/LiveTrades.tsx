'use client';

import ClientTime from '@/components/ClientTime';
import TraderInfoModal from '@/components/TraderInfoModal';
import {
  formatCompactUsd,
  formatShortAddress,
  formatTokenAmount,
} from '@/lib/format';
import { useCallback, useEffect, useState } from 'react';

type LiveTrade = {
  id: string;
  kind: 'buy' | 'sell';
  txHash: string;
  trader: string;
  tokenAmount: number;
  volumeUsd: number;
  timestamp: string;
};

const REFRESH_MS = 15_000;

export default function LiveTrades({
  mint,
  pairAddress,
  embedded = false,
}: {
  mint: string;
  pairAddress: string;
  embedded?: boolean;
}) {
  const [trades, setTrades] = useState<LiveTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrader, setSelectedTrader] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/token/${mint}/live-trades?pair=${encodeURIComponent(pairAddress)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load trades');
      setTrades(data.trades);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load trades');
    } finally {
      setLoading(false);
    }
  }, [mint, pairAddress]);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  const content = (
    <>
      {loading && trades.length === 0 && (
        <p className="py-6 text-center text-sm text-zinc-500">Loading trades…</p>
      )}

      {error && (
        <p className="py-6 text-center text-sm text-red-400">{error}</p>
      )}

      {!error && trades.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Side</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">USD</th>
                <th className="px-3 py-2 text-right">Trader</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr
                  key={trade.id}
                  className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-900/60"
                >
                  <td className="px-3 py-2 text-xs text-zinc-400">
                    <ClientTime date={new Date(trade.timestamp)} />
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        trade.kind === 'buy' ? 'text-lime-400' : 'text-red-400'
                      }
                    >
                      {trade.kind.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 tabular-nums text-zinc-300">
                    {formatTokenAmount(trade.tokenAmount)}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-zinc-300">
                    {formatCompactUsd(trade.volumeUsd)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedTrader(trade.trader)}
                      className="font-mono text-xs text-zinc-400 hover:text-lime-400"
                    >
                      {formatShortAddress(trade.trader)}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedTrader && (
        <TraderInfoModal
          wallet={selectedTrader}
          mint={mint}
          pairAddress={pairAddress}
          onClose={() => setSelectedTrader(null)}
        />
      )}
    </>
  );

  if (embedded) return content;

  return (
    <section className="rounded-xl border border-zinc-800 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Live trades</h2>
        <p className="text-xs text-zinc-500">via GeckoTerminal · every 15s</p>
      </div>
      {content}
    </section>
  );
}
