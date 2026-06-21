'use client';

import {
  changeColorClass,
  formatAge,
  formatChange,
  formatCompactUsd,
  formatCount,
  formatPrice,
} from '@/lib/format';
import type { TrendingToken } from '@/lib/dexscreener';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

const PAGE_SIZE = 20;
const REFRESH_MS = 30_000;

function ChangeCell({ value }: { value: number | null }) {
  return (
    <td className={`px-3 py-3 text-right text-sm tabular-nums ${changeColorClass(value)}`}>
      {formatChange(value)}
    </td>
  );
}

export default function TrendingList() {
  const [tokens, setTokens] = useState<TrendingToken[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadPage = useCallback((nextPage: number, silent = false) => {
    if (!silent) setLoading(true);
    setError(null);

    fetch(`/api/trending?page=${nextPage}&limit=${PAGE_SIZE}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setTokens(data.tokens);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotal(data.total);
        setLastUpdated(new Date());
      })
      .catch(() => setError('Failed to load trending tokens'))
      .finally(() => {
        if (!silent) setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  useEffect(() => {
    const id = setInterval(() => loadPage(page, true), REFRESH_MS);
    return () => clearInterval(id);
  }, [page, loadPage]);

  if (loading && tokens.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">Loading trending...</p>
    );
  }

  if (error && tokens.length === 0) {
    return <p className="py-12 text-center text-sm text-red-400">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-zinc-500">
          {total} tokens · ranked by DexScreener boosts (top + latest). Makers column
          isn&apos;t available in the public API.
        </p>
        {lastUpdated && (
          <p className="text-xs text-zinc-600">
            Updated {lastUpdated.toLocaleTimeString()} · auto-refresh 30s
          </p>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="min-w-[1100px] w-full text-left">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <th className="px-3 py-3 w-10">#</th>
              <th className="px-3 py-3 min-w-[180px]">Token</th>
              <th className="px-3 py-3 text-right">MCAP</th>
              <th className="px-3 py-3 text-right">Price</th>
              <th className="px-3 py-3 text-right">Age</th>
              <th className="px-3 py-3 text-right">TXNS</th>
              <th className="px-3 py-3 text-right">Volume</th>
              <th className="px-3 py-3 text-right">5M</th>
              <th className="px-3 py-3 text-right">1H</th>
              <th className="px-3 py-3 text-right">6H</th>
              <th className="px-3 py-3 text-right">24H</th>
              <th className="px-3 py-3 text-right">Liquidity</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, index) => {
              const rank = (page - 1) * PAGE_SIZE + index + 1;
              return (
                <tr
                  key={token.mint}
                  className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-900/60"
                >
                  <td className="px-3 py-3 text-sm text-zinc-500 tabular-nums">{rank}</td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/token/${token.mint}`}
                      className="flex min-w-0 items-center gap-3"
                    >
                      {token.imageUrl ? (
                        <img
                          src={token.imageUrl}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-full bg-zinc-800 object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-lime-400">
                          {token.symbol.slice(0, 2)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">
                          {token.symbol}
                          <span className="font-normal text-zinc-500">
                            {' '}
                            / {token.quoteSymbol}
                          </span>
                        </p>
                        <p className="truncate text-xs text-zinc-500">{token.name}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-right text-sm text-white tabular-nums">
                    {formatCompactUsd(token.marketCap)}
                  </td>
                  <td className="px-3 py-3 text-right text-sm text-white tabular-nums">
                    {formatPrice(token.priceUsd)}
                  </td>
                  <td className="px-3 py-3 text-right text-sm text-zinc-400 tabular-nums">
                    {formatAge(token.pairCreatedAt)}
                  </td>
                  <td className="px-3 py-3 text-right text-sm text-zinc-300 tabular-nums">
                    {formatCount(token.txns24h)}
                  </td>
                  <td className="px-3 py-3 text-right text-sm text-zinc-300 tabular-nums">
                    {formatCompactUsd(token.volume24h)}
                  </td>
                  <ChangeCell value={token.change5m} />
                  <ChangeCell value={token.change1h} />
                  <ChangeCell value={token.change6h} />
                  <ChangeCell value={token.change24h} />
                  <td className="px-3 py-3 text-right text-sm text-zinc-300 tabular-nums">
                    {formatCompactUsd(token.liquidityUsd)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {loading && (
        <p className="text-center text-xs text-zinc-500">Updating...</p>
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-500">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => loadPage(page - 1)}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 disabled:opacity-40 hover:bg-zinc-900"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => loadPage(page + 1)}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 disabled:opacity-40 hover:bg-zinc-900"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
