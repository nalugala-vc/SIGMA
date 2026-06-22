import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress, getMint } from '@solana/spl-token';
import { LAMPORTS_PER_SOL } from '@/lib/constants';

function getRpcUrl() {
  return process.env.NEXT_PUBLIC_SOLANA_RPC_URL!;
}

export async function getSolBalance(walletAddress: string): Promise<number> {
  const connection = new Connection(getRpcUrl());
  const lamports = await connection.getBalance(new PublicKey(walletAddress));
  return lamports / LAMPORTS_PER_SOL;
}

export async function getTokenBalance(
  walletAddress: string,
  mintAddress: string
): Promise<{ rawAmount: string; decimals: number; uiAmount: number } | null> {
  const connection = new Connection(getRpcUrl());
  const owner = new PublicKey(walletAddress);
  const mint = new PublicKey(mintAddress);
  const ata = await getAssociatedTokenAddress(mint, owner);

  try {
    const [account, mintInfo] = await Promise.all([
      getAccount(connection, ata),
      getMint(connection, mint),
    ]);
    const decimals = mintInfo.decimals;
    const uiAmount = Number(account.amount) / 10 ** decimals;
    return {
      rawAmount: account.amount.toString(),
      decimals,
      uiAmount,
    };
  } catch {
    return null;
  }
}

export function toRawAmount(uiAmount: number, decimals: number): string {
  return BigInt(Math.floor(uiAmount * 10 ** decimals)).toString();
}
