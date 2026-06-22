'use client';

import DepositCryptoModal from '@/components/DepositCryptoModal';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { formatShortAddress } from '@/lib/format';
import { useConnectWallet } from '@privy-io/react-auth';
import { useCallback, useEffect, useState } from 'react';

export default function WalletPanel() {
  const { connectWallet } = useConnectWallet();
  const { wallet, walletLabel } = useSolanaWallet();
  const [copied, setCopied] = useState(false);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [showDeposit, setShowDeposit] = useState(false);

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
    <>
      <section className="rounded-xl border border-zinc-800 p-4">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Your wallet</h2>
            {walletLabel && (
              <p className="text-xs text-zinc-500">{walletLabel}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Balance
            </p>
            <p className="text-lg font-semibold tabular-nums">
              {solBalance !== null ? `${solBalance.toFixed(4)} SOL` : '…'}
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowDeposit(true)}
            className="rounded-full bg-sigma px-5 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(240,43,242,0.25)] hover:bg-sigma-light"
          >
            Deposit crypto
          </button>
          <button
            type="button"
            onClick={loadBalance}
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            Refresh balance
          </button>
        </div>

        <div className="mb-3 flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2">
          <code className="min-w-0 flex-1 font-mono text-xs text-zinc-300">
            {formatShortAddress(wallet.address)}
          </code>
          <button
            type="button"
            onClick={copyAddress}
            className="shrink-0 rounded-md bg-zinc-800 px-2 py-1 text-xs font-medium text-sigma hover:bg-zinc-700"
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
        </div>

        {needsFunding && (
          <p className="mt-3 rounded-lg border border-amber-900/50 bg-amber-950/30 px-3 py-2 text-sm text-amber-200">
            You need SOL to buy tokens and pay fees. Tap{' '}
            <strong>Deposit crypto</strong> to add funds via card or transfer.
          </p>
        )}
      </section>

      {showDeposit && (
        <DepositCryptoModal
          address={wallet.address}
          onClose={() => setShowDeposit(false)}
          onFunded={loadBalance}
        />
      )}
    </>
  );
}
