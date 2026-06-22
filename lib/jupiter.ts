import { JUPITER_LITE_API } from '@/lib/constants';

export type JupiterQuote = {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct?: string;
  routePlan?: unknown[];
  [key: string]: unknown;
};

export async function fetchJupiterQuote(params: {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps?: number;
}): Promise<JupiterQuote> {
  const { inputMint, outputMint, amount, slippageBps = 100 } = params;
  const url = `${JUPITER_LITE_API}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || 'Failed to fetch Jupiter quote');
  }

  return res.json();
}

export async function buildJupiterSwapTransaction(params: {
  quoteResponse: JupiterQuote;
  userPublicKey: string;
}): Promise<{ swapTransaction: string }> {
  const res = await fetch(`${JUPITER_LITE_API}/swap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({
      quoteResponse: params.quoteResponse,
      userPublicKey: params.userPublicKey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: 'auto',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || 'Failed to build Jupiter swap transaction');
  }

  return res.json();
}
