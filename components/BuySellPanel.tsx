'use client';

import { DEFAULT_TOKEN_DECIMALS, LAMPORTS_PER_SOL } from '@/lib/constants';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { usePrivy } from '@privy-io/react-auth';
import { useSignAndSendTransaction } from '@privy-io/react-auth/solana';
import { VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { useCallback, useEffect, useState } from 'react';

type Side = 'buy' | 'sell';

type BuySellPanelProps = {
  mint: string;
  symbol: string;
};

function formatSignature(signature: Uint8Array | string): string {
  if (typeof signature === 'string') return signature;
  return bs58.encode(signature);
}

export default function BuySellPanel({ mint, symbol }: BuySellPanelProps) {
  const { user } = usePrivy();
  const { wallet, walletLabel } = useSolanaWallet();
  const { signAndSendTransaction } = useSignAndSendTransaction();

  const [side, setSide] = useState<Side>('buy');
  const [amount, setAmount] = useState('0.01');
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [tokenDecimals, setTokenDecimals] = useState(DEFAULT_TOKEN_DECIMALS);
  const [quotePreview, setQuotePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const loadBalances = useCallback(async () => {
    if (!wallet?.address) return;
    const res = await fetch(
      `/api/wallet/balance?wallet=${wallet.address}&mint=${mint}`
    );
    if (!res.ok) return;
    const data = await res.json();
    setSolBalance(data.solBalance);
    setTokenBalance(data.tokenBalance?.uiAmount ?? 0);
    if (data.tokenBalance?.decimals != null) {
      setTokenDecimals(data.tokenBalance.decimals);
    }
  }, [wallet?.address, mint]);

  useEffect(() => {
    loadBalances();
  }, [loadBalances]);

  async function handleTrade(sellAll = false) {
    if (!wallet?.address || !user?.id) {
      setStatus('error');
      setMessage('Wallet not ready. Please wait a moment and try again.');
      return;
    }

    setStatus('loading');
    setMessage(null);
    setTxSignature(null);
    setQuotePreview(null);

    try {
      const prepareRes = await fetch('/api/swap/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          side,
          mint,
          userPublicKey: wallet.address,
          amount: sellAll ? undefined : parseFloat(amount),
          sellAll,
        }),
      });

      const prepared = await prepareRes.json();
      if (!prepareRes.ok) {
        throw new Error(prepared.error || 'Failed to prepare swap');
      }

      if (side === 'buy') {
        const outUi = Number(prepared.quote.outAmount) / 10 ** tokenDecimals;
        setQuotePreview(`~${outUi.toLocaleString()} ${symbol}`);
      } else {
        const outSol = Number(prepared.quote.outAmount) / LAMPORTS_PER_SOL;
        setQuotePreview(`~${outSol.toFixed(4)} SOL`);
      }

      const txBuffer = Buffer.from(prepared.swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(txBuffer);

      const { signature } = await signAndSendTransaction({
        transaction: transaction.serialize(),
        wallet,
        chain: 'solana:mainnet',
      });

      const txSig = formatSignature(signature);

      const logRes = await fetch('/api/trades/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privyUserId: user.id,
          tokenMint: mint,
          side,
          amountIn: prepared.quote.inAmount,
          amountOut: prepared.quote.outAmount,
          txSignature: txSig,
        }),
      });

      if (!logRes.ok) {
        const logError = await logRes.json();
        console.error('Trade log failed:', logError);
      }

      setTxSignature(txSig);
      setStatus('success');
      setMessage(`${side === 'buy' ? 'Buy' : 'Sell'} submitted successfully.`);
      await loadBalances();
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Trade failed');
    }
  }

  return (
    <section className="rounded-xl border border-zinc-800 p-4">
      <h2 className="mb-4 text-lg font-semibold">Trade</h2>

      {walletLabel && (
        <p className="mb-3 text-xs text-zinc-500">Using {walletLabel}</p>
      )}

      {solBalance !== null && solBalance < 0.01 && side === 'buy' && (
        <p className="mb-3 rounded-lg border border-amber-900/50 bg-amber-950/30 px-3 py-2 text-xs text-amber-200">
          Low SOL balance. Fund your wallet on the home page or connect Phantom
          if you already have SOL.
        </p>
      )}

      <div className="mb-4 flex gap-2">
        {(['buy', 'sell'] as Side[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSide(tab)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize ${
              side === tab
                ? tab === 'buy'
                  ? 'bg-lime-400 text-black'
                  : 'bg-red-500 text-white'
                : 'border border-zinc-700 text-zinc-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {wallet?.address && (
        <div className="mb-4 flex flex-wrap gap-4 text-xs text-zinc-500">
          <span>SOL: {solBalance?.toFixed(4) ?? '…'}</span>
          <span>
            {symbol}: {tokenBalance?.toLocaleString() ?? '0'}
          </span>
        </div>
      )}

      {side === 'buy' ? (
        <div className="mb-4">
          <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
            Amount (SOL)
          </label>
          <input
            type="number"
            min="0"
            step="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
          />
          <div className="mt-2 flex gap-2">
            {['0.01', '0.05', '0.1'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-900"
              >
                {preset} SOL
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
            Amount ({symbol})
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
          />
        </div>
      )}

      {quotePreview && status === 'loading' && (
        <p className="mb-3 text-sm text-zinc-400">Expected output: {quotePreview}</p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={status === 'loading' || !wallet}
          onClick={() => handleTrade(false)}
          className={`flex-1 rounded-lg py-3 font-bold disabled:opacity-50 ${
            side === 'buy' ? 'bg-lime-400 text-black' : 'bg-red-500 text-white'
          }`}
        >
          {status === 'loading' ? 'Processing…' : side === 'buy' ? 'Buy' : 'Sell'}
        </button>
        {side === 'sell' && (
          <button
            type="button"
            disabled={status === 'loading' || !wallet || !tokenBalance}
            onClick={() => handleTrade(true)}
            className="rounded-lg border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 disabled:opacity-50 hover:bg-zinc-900"
          >
            Sell all
          </button>
        )}
      </div>

      {message && (
        <p
          className={`mt-3 text-sm ${
            status === 'success' ? 'text-lime-400' : 'text-red-400'
          }`}
        >
          {message}
        </p>
      )}

      {txSignature && (
        <a
          href={`https://solscan.io/tx/${txSignature}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-lime-400 hover:underline"
        >
          View on Solscan ↗
        </a>
      )}

      <p className="mt-4 text-xs text-zinc-600">
        Swaps via Jupiter lite-api. You need SOL in your wallet for buys and
        transaction fees. Slippage: 1%.
      </p>
    </section>
  );
}
