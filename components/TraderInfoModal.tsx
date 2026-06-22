'use client';

import {
  formatCompactUsd,
  formatShortAddress,
  formatTokenAmount,
} from '@/lib/format';
import { formatHolderDuration, type TraderStats } from '@/lib/trader-stats';
import { useCallback, useEffect, useState } from 'react';

export default function TraderInfoModal({
  wallet,
  mint,
  pairAddress,
  onClose,
}: {
  wallet: string;
  mint: string;
  pairAddress: string;
  onClose: () => void;
}) {
  const [stats, setStats] = useState<TraderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/token/${mint}/trader?wallet=${encodeURIComponent(wallet)}&pair=${encodeURIComponent(pairAddress)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load trader');
      setStats(data.stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load trader');
    } finally {
      setLoading(false);
    }
  }, [wallet, mint, pairAddress]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const holdPct =
    stats && stats.boughtTokens > 0
      ? Math.min(100, (stats.balance / stats.boughtTokens) * 100)
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Trader info"
      >
        {loading && (
          <p className="py-8 text-center text-sm text-zinc-500">Loading trader…</p>
        )}

        {error && (
          <p className="py-8 text-center text-sm text-red-400">{error}</p>
        )}

        {stats && !loading && (
          <>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-red-400">(-) Bought:</span>
                <span className="text-zinc-300">
                  {formatCompactUsd(stats.boughtUsd)}{' '}
                  <span className="text-zinc-500">
                    {formatTokenAmount(stats.boughtTokens)}{' '}
                    {stats.buyTxns} txns
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-lime-400">(+) Sold:</span>
                <span className="text-zinc-300">
                  {formatCompactUsd(stats.soldUsd)}{' '}
                  <span className="text-zinc-500">
                    {formatTokenAmount(stats.soldTokens)}{' '}
                    {stats.sellTxns} txns
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-lime-400">(=) PNL:</span>
                <span
                  className={
                    stats.pnlUsd >= 0 ? 'text-lime-400' : 'text-red-400'
                  }
                >
                  {formatCompactUsd(Math.abs(stats.pnlUsd))}
                  {stats.pnlUsd < 0 ? ' loss' : ''}
                </span>
              </div>
              <div className="pt-1">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Unrealized:</span>
                  <span>
                    {formatTokenAmount(stats.balance)} of{' '}
                    {formatTokenAmount(stats.boughtTokens || stats.balance)}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-lime-400 transition-all"
                    style={{ width: `${holdPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-zinc-800 pt-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden>
                  {stats.tier.emoji}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-white">
                    {formatShortAddress(stats.wallet, 6)}
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-400">
                    {stats.tier.label}: {stats.tier.description}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Holder since: {formatHolderDuration(stats.holderSince)}
                  </p>
                  {stats.tradeSampleSize === 0 && (
                    <p className="mt-1 text-xs text-zinc-600">
                      No recent pool trades found for this wallet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <a
              href={`https://solscan.io/account/${stats.wallet}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Open in block explorer
              <span aria-hidden>↗</span>
            </a>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full py-2 text-sm text-zinc-500 hover:text-zinc-300"
        >
          Close
        </button>
      </div>
    </div>
  );
}
