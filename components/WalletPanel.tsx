'use client';

import FundWalletGuide from '@/components/FundWalletGuide';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { useConnectWallet } from '@privy-io/react-auth';
import { useCallback, useEffect, useState } from 'react';

export default function WalletPanel() {
  const { connectWallet } = useConnectWallet();
  const { wallet, walletLabel } = useSolanaWallet();
  const [copied, setCopied] = useState(false);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const loadBalance = useCallback(async () => {
    if (!wallet?.address) return;
    const res = await fetch(`/api/wallet/balance?wallet=${wallet.address}`);
    if (!res.ok) return;
    const data = await res.json();
    setSolBalance(data.solBalance);
  }, [wallet?.address]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  async function copyAddress() {
    if (!wallet?.address) return;
    await navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!wallet?.address) {
    return (
      <section className="rounded-xl border border-zinc-800 p-4">
        <p className="text-sm text-zinc-500">Wallet loading…</p>
      </section>
    );
  }

  const needsFunding = solBalance !== null && solBalance < 0.01;

  return (
    <section className="rounded-xl border border-zinc-800 p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Your wallet</h2>
          {walletLabel && (
            <p className="text-xs text-zinc-500">{walletLabel}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Balance</p>
          <p className="text-lg font-semibold tabular-nums">
            {solBalance !== null ? `${solBalance.toFixed(4)} SOL` : '…'}
          </p>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2">
        <code className="min-w-0 flex-1 truncate text-xs text-zinc-300">
          {wallet.address}
        </code>
        <button
          type="button"
          onClick={copyAddress}
          className="shrink-0 rounded-md bg-zinc-800 px-2 py-1 text-xs font-medium text-lime-400 hover:bg-zinc-700"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={`https://solscan.io/account/${wallet.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900"
        >
          View on Solscan ↗
        </a>
        <button
          type="button"
          onClick={() => connectWallet()}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900"
        >
          Connect Phantom / other wallet
        </button>
        <button
          type="button"
          onClick={() => setShowGuide((v) => !v)}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900"
        >
          {showGuide ? 'Hide guide' : 'How to add SOL'}
        </button>
      </div>

      {needsFunding && (
        <p className="mt-3 rounded-lg border border-amber-900/50 bg-amber-950/30 px-3 py-2 text-sm text-amber-200">
          You need SOL to buy tokens and pay fees. Use the guide below to fund
          your wallet, or connect Phantom if you already have SOL there.
        </p>
      )}

      {showGuide && (
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <h3 className="mb-2 text-sm font-medium text-zinc-300">
            How to fund your wallet
          </h3>
          <FundWalletGuide />
        </div>
      )}
    </section>
  );
}
