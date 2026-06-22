import { fetchPoolTrades } from '@/lib/geckoterminal';
import { getTokenBalance } from '@/lib/solana';

export type TraderTier = {
  label: string;
  emoji: string;
  description: string;
};

export type TraderStats = {
  wallet: string;
  boughtUsd: number;
  soldUsd: number;
  boughtTokens: number;
  soldTokens: number;
  buyTxns: number;
  sellTxns: number;
  pnlUsd: number;
  balance: number;
  holderSince: string | null;
  tier: TraderTier;
  tradeSampleSize: number;
};

function getTraderTier(totalVolumeUsd: number): TraderTier {
  if (totalVolumeUsd >= 100_000) {
    return {
      label: 'Whale',
      emoji: '🐋',
      description: '$100k+ bought or sold',
    };
  }
  if (totalVolumeUsd >= 10_000) {
    return {
      label: 'Dolphin',
      emoji: '🐬',
      description: '$10k–$100k bought or sold',
    };
  }
  if (totalVolumeUsd >= 1_000) {
    return {
      label: 'Fish',
      emoji: '🐟',
      description: '$1k–$10k bought or sold',
    };
  }
  if (totalVolumeUsd >= 250) {
    return {
      label: 'Shrimp',
      emoji: '🦐',
      description: '$250–$1k bought or sold',
    };
  }
  return {
    label: 'Plankton',
    emoji: '🦠',
    description: 'Under $250 bought or sold',
  };
}

export async function fetchTraderStats(
  poolAddress: string,
  tokenMint: string,
  walletAddress: string
): Promise<TraderStats> {
  const trades = await fetchPoolTrades(poolAddress, tokenMint, 300);
  const walletTrades = trades.filter((t) => t.trader === walletAddress);

  let boughtUsd = 0;
  let soldUsd = 0;
  let boughtTokens = 0;
  let soldTokens = 0;
  let buyTxns = 0;
  let sellTxns = 0;
  let holderSince: string | null = null;

  for (const trade of walletTrades) {
    if (trade.kind === 'buy') {
      boughtUsd += trade.volumeUsd;
      boughtTokens += trade.tokenAmount;
      buyTxns++;
    } else {
      soldUsd += trade.volumeUsd;
      soldTokens += trade.tokenAmount;
      sellTxns++;
    }
    if (!holderSince || trade.timestamp < holderSince) {
      holderSince = trade.timestamp;
    }
  }

  const balanceResult = await getTokenBalance(walletAddress, tokenMint);
  const balance = balanceResult?.uiAmount ?? 0;

  return {
    wallet: walletAddress,
    boughtUsd,
    soldUsd,
    boughtTokens,
    soldTokens,
    buyTxns,
    sellTxns,
    pnlUsd: soldUsd - boughtUsd,
    balance,
    holderSince,
    tier: getTraderTier(boughtUsd + soldUsd),
    tradeSampleSize: walletTrades.length,
  };
}

export function formatHolderDuration(iso: string | null): string {
  if (!iso) return '—';
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return '—';
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${Math.max(1, minutes)}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}
