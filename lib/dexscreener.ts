export type TrendingToken = {
  mint: string;
  name: string;
  symbol: string;
  quoteSymbol: string;
  priceUsd: number | null;
  marketCap: number | null;
  pairCreatedAt: number | null;
  txns24h: number | null;
  volume24h: number | null;
  change5m: number | null;
  change1h: number | null;
  change6h: number | null;
  change24h: number | null;
  liquidityUsd: number | null;
  imageUrl: string | null;
  dexUrl: string | null;
};

type DexPair = {
  url?: string;
  pairAddress?: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken?: { symbol?: string | null };
  priceUsd?: string | null;
  marketCap?: number | null;
  pairCreatedAt?: number | null;
  txns?: {
    m5?: { buys?: number; sells?: number };
    h1?: { buys?: number; sells?: number };
    h24?: { buys?: number; sells?: number };
  };
  volume?: { h24?: number };
  priceChange?: { m5?: number; h1?: number; h6?: number; h24?: number } | null;
  liquidity?: { usd?: number | null } | null;
  info?: { imageUrl?: string | null } | null;
};

type TokenBoost = {
  chainId: string;
  tokenAddress: string;
};

export type TokenDetail = TrendingToken & {
  pairAddress: string | null;
  txnsM5: { buys: number; sells: number } | null;
  txnsH1: { buys: number; sells: number } | null;
  txnsH24: { buys: number; sells: number } | null;
};

export type TrendingResult = {
  tokens: TrendingToken[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function bestPairForMint(pairs: DexPair[], mint: string): DexPair | undefined {
  return pairs
    .filter((p) => p.baseToken.address === mint)
    .reduce<DexPair | undefined>((best, pair) => {
      const liq = pair.liquidity?.usd ?? 0;
      const bestLiq = best?.liquidity?.usd ?? 0;
      return liq > bestLiq ? pair : best;
    }, undefined);
}

function pairToToken(mint: string, pair: DexPair): TrendingToken {
  const buys = pair.txns?.h24?.buys ?? 0;
  const sells = pair.txns?.h24?.sells ?? 0;

  return {
    mint,
    name: pair.baseToken.name,
    symbol: pair.baseToken.symbol,
    quoteSymbol: pair.quoteToken?.symbol ?? 'SOL',
    priceUsd: pair.priceUsd ? parseFloat(pair.priceUsd) : null,
    marketCap: pair.marketCap ?? null,
    pairCreatedAt: pair.pairCreatedAt ?? null,
    txns24h: buys + sells > 0 ? buys + sells : null,
    volume24h: pair.volume?.h24 ?? null,
    change5m: pair.priceChange?.m5 ?? null,
    change1h: pair.priceChange?.h1 ?? null,
    change6h: pair.priceChange?.h6 ?? null,
    change24h: pair.priceChange?.h24 ?? null,
    liquidityUsd: pair.liquidity?.usd ?? null,
    imageUrl: pair.info?.imageUrl ?? null,
    dexUrl: pair.url ?? null,
  };
}

async function fetchBoostAddresses(): Promise<string[]> {
  const [topRes, latestRes] = await Promise.all([
    fetch('https://api.dexscreener.com/token-boosts/top/v1', {
      next: { revalidate: 60 },
    }),
    fetch('https://api.dexscreener.com/token-boosts/latest/v1', {
      next: { revalidate: 60 },
    }),
  ]);

  if (!topRes.ok && !latestRes.ok) {
    throw new Error('Failed to fetch trending tokens from DexScreener');
  }

  const top: TokenBoost[] = topRes.ok ? await topRes.json() : [];
  const latest: TokenBoost[] = latestRes.ok ? await latestRes.json() : [];

  const seen = new Set<string>();
  const addresses: string[] = [];

  for (const boost of [...top, ...latest]) {
    if (boost.chainId !== 'solana' || seen.has(boost.tokenAddress)) continue;
    seen.add(boost.tokenAddress);
    addresses.push(boost.tokenAddress);
  }

  return addresses;
}

async function fetchPairsForAddresses(addresses: string[]): Promise<DexPair[]> {
  const pairs: DexPair[] = [];

  for (let i = 0; i < addresses.length; i += 30) {
    const chunk = addresses.slice(i, i + 30);
    const res = await fetch(
      `https://api.dexscreener.com/tokens/v1/solana/${chunk.join(',')}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) {
      throw new Error('Failed to fetch token prices from DexScreener');
    }
    pairs.push(...(await res.json()));
  }

  return pairs;
}

function pairToDetail(mint: string, pair: DexPair): TokenDetail {
  const base = pairToToken(mint, pair);
  const mapTxns = (t?: { buys?: number; sells?: number }) =>
    t ? { buys: t.buys ?? 0, sells: t.sells ?? 0 } : null;

  return {
    ...base,
    pairAddress: pair.pairAddress ?? null,
    txnsM5: mapTxns(pair.txns?.m5),
    txnsH1: mapTxns(pair.txns?.h1),
    txnsH24: mapTxns(pair.txns?.h24),
  };
}

export async function fetchTrendingSolanaTokens(
  page = 1,
  limit = 20
): Promise<TrendingResult> {
  const addresses = await fetchBoostAddresses();
  const pairs = addresses.length > 0 ? await fetchPairsForAddresses(addresses) : [];

  const allTokens = addresses
    .map((mint) => {
      const pair = bestPairForMint(pairs, mint);
      return pair ? pairToToken(mint, pair) : null;
    })
    .filter((token): token is TrendingToken => token !== null);

  const total = allTokens.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * limit;
  const tokens = allTokens.slice(start, start + limit);

  return { tokens, total, page: safePage, limit, totalPages };
}

export async function fetchTokenByMint(mint: string): Promise<TokenDetail | null> {
  const pairsRes = await fetch(
    `https://api.dexscreener.com/tokens/v1/solana/${mint}`,
    { next: { revalidate: 30 } }
  );
  if (!pairsRes.ok) return null;

  const pairs: DexPair[] = await pairsRes.json();
  const pair = bestPairForMint(pairs, mint);
  return pair ? pairToDetail(mint, pair) : null;
}
