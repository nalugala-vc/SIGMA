'use client';

import FundWalletGuide from '@/components/FundWalletGuide';
import { formatShortAddress } from '@/lib/format';
import { useFundWallet } from '@privy-io/react-auth/solana';
import { useCallback, useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

function FundingNotEnabledHelp() {
  return (
    <div className="mb-4 rounded-xl border border-amber-900/40 bg-amber-950/20 p-3 text-xs text-amber-100">
      <p className="font-medium text-amber-200">Card on-ramp not enabled yet</p>
      <p className="mt-1 text-amber-100/90">
        This is turned on in the <strong>Privy dashboard</strong>, not in code.
        Until then, use the QR code above to send SOL from Phantom or an exchange.
      </p>
      <ol className="mt-2 list-decimal space-y-1 pl-4 text-amber-100/80">
        <li>
          Go to{' '}
          <a
            href="https://dashboard.privy.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sigma underline"
          >
            dashboard.privy.io
          </a>{' '}
          → your app
        </li>
        <li>Wallets → Funding (or Monetization)</li>
        <li>Enable MoonPay for Solana / SOL</li>
        <li>Save, redeploy, then try again</li>
      </ol>
    </div>
  );
}

export default function DepositCryptoModal({
  address,
  onClose,
  onFunded,
}: {
  address: string;
  onClose: () => void;
  onFunded?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [funding, setFunding] = useState(false);
  const [fundError, setFundError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { fundWallet } = useFundWallet({
    onUserExited: () => {
      setFunding(false);
      onFunded?.();
    },
  });

  const fundingDisabled =
    fundError?.toLowerCase().includes('not enabled') ?? false;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const copyAddress = useCallback(async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [address]);

  async function refreshBalance() {
    setRefreshing(true);
    await onFunded?.();
    setTimeout(() => setRefreshing(false), 600);
  }

  async function buyWithCard() {
    setFunding(true);
    setFundError(null);
    try {
      await fundWallet({
        address,
        options: {
          chain: 'solana:mainnet',
          amount: '0.1',
          asset: 'native-currency',
          defaultFundingMethod: 'card',
          card: { preferredProvider: 'moonpay' },
          uiConfig: {
            receiveFundsTitle: 'Deposit SOL',
            receiveFundsSubtitle: 'Send SOL to your SIGMA wallet',
            landing: { title: 'Add funds to trade' },
          },
        },
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Could not open card on-ramp';
      setFundError(message);
      setFunding(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-800 bg-black p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Deposit crypto"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Deposit crypto</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Send SOL to the address below
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-zinc-500 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            After you scan
          </p>
          <ol className="list-decimal space-y-1.5 pl-4 text-sm text-zinc-300">
            <li>In Phantom (or your exchange), tap <strong>Send</strong></li>
            <li>Scan this QR or paste the address</li>
            <li>
              Pick network: <strong>Solana</strong> — not Ethereum
            </li>
            <li>Send an amount of SOL + network fees</li>
            <li>Wait ~1 minute, then tap refresh below</li>
            <li>Close this modal and buy from Trending</li>
          </ol>
        </div>

        <div className="mb-4 flex justify-center rounded-xl border border-zinc-800 bg-white p-4">
          <QRCode
            value={address}
            size={200}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
          />
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2">
          <code className="min-w-0 flex-1 font-mono text-xs text-zinc-300">
            {formatShortAddress(address, 6)}
          </code>
          <button
            type="button"
            onClick={copyAddress}
            className="shrink-0 rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-sigma hover:bg-zinc-700"
          >
            {copied ? 'Copied!' : 'Copy address'}
          </button>
        </div>

        <button
          type="button"
          onClick={refreshBalance}
          disabled={refreshing}
          className="mb-4 w-full rounded-full border border-zinc-700 py-3 text-sm font-semibold text-white hover:bg-zinc-900 disabled:opacity-60"
        >
          {refreshing ? 'Checking balance…' : "I've sent SOL — refresh balance"}
        </button>

        <div className="border-t border-zinc-800 pt-4">
          <p className="mb-2 text-xs text-zinc-500">Optional — buy with card</p>
          <button
            type="button"
            onClick={buyWithCard}
            disabled={funding || fundingDisabled}
            className="mb-3 w-full rounded-full bg-sigma py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(240,43,242,0.3)] transition hover:bg-sigma-light disabled:opacity-50"
          >
            {funding ? 'Opening on-ramp…' : 'Buy SOL with card'}
          </button>

          {fundError && !fundingDisabled && (
            <p className="mb-3 text-center text-xs text-red-400">{fundError}</p>
          )}

          {fundingDisabled && <FundingNotEnabledHelp />}
        </div>

        <div className="border-t border-zinc-800 pt-4">
          <h3 className="mb-2 text-sm font-medium text-zinc-300">
            More detail
          </h3>
          <FundWalletGuide />
        </div>
      </div>
    </div>
  );
}
