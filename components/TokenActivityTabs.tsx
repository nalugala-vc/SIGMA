'use client';

import HoldersList from '@/components/HoldersList';
import LiveTrades from '@/components/LiveTrades';
import { formatCount } from '@/lib/format';
import { useState } from 'react';

type Tab = 'trades' | 'holders' | 'activity';

type TxnWindow = { buys: number; sells: number } | null;

function TxnRow({ label, txns }: { label: string; txns: TxnWindow }) {
  if (!txns) {
    return (
      <div className="flex items-center justify-between py-2 text-sm text-zinc-500">
        <span>{label}</span>
        <span>—</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-zinc-400">{label}</span>
      <div className="flex gap-4 tabular-nums">
        <span className="text-lime-400">{formatCount(txns.buys)} buys</span>
        <span className="text-red-400">{formatCount(txns.sells)} sells</span>
      </div>
    </div>
  );
}

function RecentActivity({
  txnsM5,
  txnsH1,
  txnsH24,
}: {
  txnsM5: TxnWindow;
  txnsH1: TxnWindow;
  txnsH24: TxnWindow;
}) {
  return (
    <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 px-4">
      <TxnRow label="Last 5 minutes" txns={txnsM5} />
      <TxnRow label="Last hour" txns={txnsH1} />
      <TxnRow label="Last 24 hours" txns={txnsH24} />
    </div>
  );
}

const TAB_LABELS: Record<Tab, string> = {
  trades: 'Live trades',
  holders: 'Holders',
  activity: 'Recent activity',
};

const TAB_HINTS: Record<Tab, string> = {
  trades: 'GeckoTerminal · every 15s',
  holders: 'Solana RPC · top 20',
  activity: 'DexScreener · refreshes every 30s',
};

export default function TokenActivityTabs({
  mint,
  pairAddress,
  txnsM5,
  txnsH1,
  txnsH24,
}: {
  mint: string;
  pairAddress: string | null;
  txnsM5: TxnWindow;
  txnsH1: TxnWindow;
  txnsH24: TxnWindow;
}) {
  const [tab, setTab] = useState<Tab>('trades');
  const tabs: Tab[] = pairAddress
    ? ['trades', 'holders', 'activity']
    : ['holders', 'activity'];

  const activeTab = tabs.includes(tab) ? tab : tabs[0];

  return (
    <section className="rounded-xl border border-zinc-800 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
          {tabs.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 ${
                activeTab === id
                  ? 'bg-lime-400 text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {TAB_LABELS[id]}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-500">{TAB_HINTS[activeTab]}</p>
      </div>

      {activeTab === 'trades' && pairAddress && (
        <LiveTrades mint={mint} pairAddress={pairAddress} embedded />
      )}

      {activeTab === 'holders' && <HoldersList mint={mint} embedded />}

      {activeTab === 'activity' && (
        <RecentActivity txnsM5={txnsM5} txnsH1={txnsH1} txnsH24={txnsH24} />
      )}
    </section>
  );
}
