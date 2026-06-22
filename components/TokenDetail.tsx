'use client';

import BuySellPanel from '@/components/BuySellPanel';
import ClientTime from '@/components/ClientTime';
import DexScreenerChart from '@/components/DexScreenerChart';
import TokenActivityTabs from '@/components/TokenActivityTabs';
import {
  changeColorClass,
  formatAge,
  formatChange,
  formatCompactUsd,
  formatCount,
  formatPrice,
} from '@/lib/format';
import type { TokenDetail as TokenDetailType } from '@/lib/dexscreener';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

const REFRESH_MS = 30_000;

function CopyMintButton({ mint }: { mint: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(mint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
    >
      {copied ? 'Copied!' : 'Copy mint address'}
    </button>
  );
}

function StatCard({
  label,
  value,
  valueClassName = 'text-white',
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 p-3">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}

export default function TokenDetail({
  mint,
  initialToken,
}: {
  mint: string;
  initialToken: TokenDetailType;
}) {
  const [token, setToken] = useState(initialToken);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/token/${mint}`);
      if (!res.ok) return;
      const data = await res.json();
      setToken(data.token);
      setLastUpdated(new Date());
    } catch {
      // keep showing stale data on refresh failure
    }
  }, [mint]);

  useEffect(() => {
    setLastUpdated(new Date());
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 bg-black px-4 py-8 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          ← Back to trending
        </Link>
        <p className="text-xs text-zinc-500">
          {lastUpdated ? (
            <>
              Updated <ClientTime date={lastUpdated} /> · refreshes every 30s
            </>
          ) : (
            <>Refreshing every 30s</>
          )}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {token.imageUrl ? (
          <img
            src={token.imageUrl}
            alt=""
            className="h-16 w-16 rounded-full bg-zinc-800 object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-lg font-bold text-lime-400">
            {token.symbol.slice(0, 2)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">
            {token.symbol}
            <span className="font-normal text-zinc-500"> / {token.quoteSymbol}</span>
          </h1>
          <p className="text-zinc-400">{token.name}</p>
        </div>
        {token.dexUrl && (
          <a
            href={token.dexUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            DexScreener ↗
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Price" value={formatPrice(token.priceUsd)} />
        <StatCard
          label="24h"
          value={formatChange(token.change24h)}
          valueClassName={changeColorClass(token.change24h)}
        />
        <StatCard label="MCAP" value={formatCompactUsd(token.marketCap)} />
        <StatCard label="Liquidity" value={formatCompactUsd(token.liquidityUsd)} />
        <StatCard label="Volume 24h" value={formatCompactUsd(token.volume24h)} />
        <StatCard label="TXNS 24h" value={formatCount(token.txns24h)} />
        <StatCard label="Age" value={formatAge(token.pairCreatedAt)} />
        <StatCard
          label="6h"
          value={formatChange(token.change6h)}
          valueClassName={changeColorClass(token.change6h)}
        />
      </div>

      <BuySellPanel mint={mint} symbol={token.symbol} />

      {token.pairAddress ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Chart</h2>
          <DexScreenerChart pairAddress={token.pairAddress} />
        </section>
      ) : (
        <p className="text-sm text-zinc-500">Chart unavailable for this token.</p>
      )}

      <TokenActivityTabs
        mint={mint}
        pairAddress={token.pairAddress}
        txnsM5={token.txnsM5}
        txnsH1={token.txnsH1}
        txnsH24={token.txnsH24}
      />

      <CopyMintButton mint={mint} />
    </main>
  );
}
