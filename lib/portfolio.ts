import { SOL_MINT } from '@/lib/constants';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

export type Holding = {
  mint: string;
  symbol: string;
  amount: number;
  priceUsd: number | null;
  valueUsd: number;
};

export type PortfolioSnapshot = {
  totalUsd: number;
  solUsd: number;
  tokensUsd: number;
  solBalance: number;
  holdings: Holding[];
};

type DexPair = {
  baseToken: { address: string; symbol: string };
  priceUsd?: string | null;
};

function getRpcUrl() {
  return process.env.NEXT_PUBLIC_SOLANA_RPC_URL!;
}

async function fetchPrices(mints: string[]): Promise<Map<string, number | null>> {
  const prices = new Map<string, number | null>();
  if (!mints.length) return prices;

  const unique = [...new Set(mints)];
  for (let i = 0; i < unique.length; i += 30) {
    const chunk = unique.slice(i, i + 30);
    const res = await fetch(
      `https://api.dexscreener.com/tokens/v1/solana/${chunk.join(',')}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) continue;

    const pairs: DexPair[] = await res.json();
    for (const mint of chunk) {
      const pair = pairs
        .filter((p) => p.baseToken.address === mint)
        .sort((a, b) => parseFloat(b.priceUsd ?? '0') - parseFloat(a.priceUsd ?? '0'))[0];
      prices.set(
        mint,
        pair?.priceUsd ? parseFloat(pair.priceUsd) : null
      );
    }
  }

  return prices;
}

export async function computePortfolio(
  walletAddress: string
): Promise<PortfolioSnapshot> {
  const connection = new Connection(getRpcUrl());
  const owner = new PublicKey(walletAddress);

  const [lamports, tokenAccounts] = await Promise.all([
    connection.getBalance(owner),
    connection.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM_ID,
    }),
  ]);

  const solBalance = lamports / 1_000_000_000;
  const mintBalances = new Map<string, number>();

  for (const { account } of tokenAccounts.value) {
    const info = account.data.parsed.info;
    const mint = info.mint as string;
    const amount = info.tokenAmount.uiAmount as number;
    if (amount > 0) {
      mintBalances.set(mint, (mintBalances.get(mint) ?? 0) + amount);
    }
  }

  const mints = [SOL_MINT, ...mintBalances.keys()];
  const prices = await fetchPrices(mints);
  const solPrice = prices.get(SOL_MINT) ?? 0;
  const solUsd = solBalance * solPrice;

  const holdings: Holding[] = [];
  let tokensUsd = 0;

  for (const [mint, amount] of mintBalances) {
    const priceUsd = prices.get(mint) ?? null;
    const valueUsd = priceUsd !== null ? amount * priceUsd : 0;
    tokensUsd += valueUsd;
    holdings.push({
      mint,
      symbol: mint.slice(0, 4),
      amount,
      priceUsd,
      valueUsd,
    });
  }

  holdings.sort((a, b) => b.valueUsd - a.valueUsd);

  const symbolRes = await fetch(
    `https://api.dexscreener.com/tokens/v1/solana/${holdings.map((h) => h.mint).join(',')}`,
    { next: { revalidate: 300 } }
  );
  if (symbolRes.ok) {
    const pairs: DexPair[] = await symbolRes.json();
    for (const holding of holdings) {
      const pair = pairs.find((p) => p.baseToken.address === holding.mint);
      if (pair) holding.symbol = pair.baseToken.symbol;
    }
  }

  return {
    totalUsd: solUsd + tokensUsd,
    solUsd,
    tokensUsd,
    solBalance,
    holdings,
  };
}
