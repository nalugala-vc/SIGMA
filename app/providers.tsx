'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';
import SyncUser from '@/components/SyncUser';
import PrivyFundingPlugin from '@/components/PrivyFundingPlugin';

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
const rpcWss = process.env.NEXT_PUBLIC_SOLANA_RPC_WSS;

export default function Providers({ children }: { children: React.ReactNode }) {
  if (!appId) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-black p-6 text-center text-white">
        <p className="text-sm text-zinc-400">
          Missing NEXT_PUBLIC_PRIVY_APP_ID. Add environment variables in Vercel
          project settings.
        </p>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['wallet', 'email', 'google', 'apple'],
        appearance: {
          theme: '#000000',
          accentColor: '#f02bf2',
          walletChainType: 'solana-only',
          showWalletLoginFirst: true,
        },
        embeddedWallets: {
          solana: { createOnLogin: 'users-without-wallets' },
        },
        fundingMethodConfig: {
          moonpay: {
            useSandbox: process.env.NODE_ENV === 'development',
          },
        },
        externalWallets: {
          solana: { connectors: toSolanaWalletConnectors() },
        },
        ...(rpcUrl && rpcWss
          ? {
              solana: {
                rpcs: {
                  'solana:mainnet': {
                    rpc: createSolanaRpc(rpcUrl),
                    rpcSubscriptions: createSolanaRpcSubscriptions(rpcWss),
                  },
                },
              },
            }
          : {}),
      }}
    >
      <PrivyFundingPlugin />
      <SyncUser />
      {children}
    </PrivyProvider>
  );
}
