export type LiveTrade = {
  id: string;
  kind: 'buy' | 'sell';
  txHash: string;
  trader: string;
  tokenAmount: number;
  quoteAmount: number;
  volumeUsd: number;
  priceUsd: number | null;
  timestamp: string;
};

type GeckoTrade = {
  id: string;
  attributes: {
    tx_hash: string;
    tx_from_address: string;
    from_token_amount: string;
    to_token_amount: string;
    price_to_in_usd: string;
    block_timestamp: string;
    kind: 'buy' | 'sell';
    volume_in_usd: string;
    from_token_address: string;
    to_token_address: string;
  };
};

const SOL_MINT = 'So11111111111111111111111111111111111111112';

export async function fetchPoolTrades(
  poolAddress: string,
  tokenMint: string,
  limit = 30
): Promise<LiveTrade[]> {
  const res = await fetch(
    `https://api.geckoterminal.com/api/v2/networks/solana/pools/${poolAddress}/trades?limit=${limit}`,
    {
      headers: { Accept: 'application/json' },
      next: { revalidate: 15 },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch live trades');
  }

  const json = (await res.json()) as { data?: GeckoTrade[] };
  const trades = json.data ?? [];

  return trades.map((trade) => {
    const a = trade.attributes;
    const isBuy = a.kind === 'buy';
    const tokenIsFrom = a.from_token_address === tokenMint;

    const tokenAmount = parseFloat(
      tokenIsFrom ? a.from_token_amount : a.to_token_amount
    );
    const quoteAmount = parseFloat(
      tokenIsFrom ? a.to_token_amount : a.from_token_amount
    );
    const priceUsd = parseFloat(a.price_to_in_usd);

    return {
      id: trade.id,
      kind: isBuy ? 'buy' : 'sell',
      txHash: a.tx_hash,
      trader: a.tx_from_address,
      tokenAmount,
      quoteAmount,
      volumeUsd: parseFloat(a.volume_in_usd),
      priceUsd: Number.isFinite(priceUsd) ? priceUsd : null,
      timestamp: a.block_timestamp,
    };
  });
}

export { SOL_MINT };
