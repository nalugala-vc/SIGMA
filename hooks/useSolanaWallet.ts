'use client';

import { useWallets } from '@privy-io/react-auth/solana';

/** Prefer an external wallet (e.g. Phantom) when connected; otherwise use Privy embedded. */
export function useSolanaWallet() {
  const { wallets, ready } = useWallets();

  const wallet =
    wallets.find((w) => w.standardWallet.name !== 'Privy') ?? wallets[0] ?? null;

  const walletLabel =
    wallet?.standardWallet.name === 'Privy'
      ? 'Privy wallet'
      : wallet?.standardWallet.name ?? null;

  return { wallet, wallets, ready, walletLabel };
}
