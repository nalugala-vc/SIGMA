'use client';

import { useSolanaFundingPlugin } from '@privy-io/react-auth/solana';

/** Required by Privy for Solana funding / on-ramp flows. */
export default function PrivyFundingPlugin() {
  useSolanaFundingPlugin();
  return null;
}
