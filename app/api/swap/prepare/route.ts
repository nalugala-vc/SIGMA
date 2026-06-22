import { SOL_MINT } from '@/lib/constants';
import { buildJupiterSwapTransaction, fetchJupiterQuote } from '@/lib/jupiter';
import { getTokenBalance, toRawAmount } from '@/lib/solana';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { side, mint, userPublicKey, amount, sellAll } = body as {
      side: 'buy' | 'sell';
      mint: string;
      userPublicKey: string;
      amount?: number;
      sellAll?: boolean;
    };

    if (!side || !mint || !userPublicKey) {
      return NextResponse.json(
        { error: 'Missing side, mint, or userPublicKey' },
        { status: 400 }
      );
    }

    if (mint === SOL_MINT) {
      return NextResponse.json({ error: 'Cannot swap SOL for SOL' }, { status: 400 });
    }

    let rawAmount: string;

    if (side === 'buy') {
      if (!amount || amount <= 0) {
        return NextResponse.json({ error: 'Invalid SOL amount' }, { status: 400 });
      }
      rawAmount = toRawAmount(amount, 9);
    } else {
      const balance = await getTokenBalance(userPublicKey, mint);
      if (!balance || balance.uiAmount <= 0) {
        return NextResponse.json({ error: 'No token balance to sell' }, { status: 400 });
      }

      if (sellAll) {
        rawAmount = balance.rawAmount;
      } else {
        if (!amount || amount <= 0) {
          return NextResponse.json({ error: 'Invalid token amount' }, { status: 400 });
        }
        if (amount > balance.uiAmount) {
          return NextResponse.json({ error: 'Amount exceeds token balance' }, { status: 400 });
        }
        rawAmount = toRawAmount(amount, balance.decimals);
      }
    }

    const inputMint = side === 'buy' ? SOL_MINT : mint;
    const outputMint = side === 'buy' ? mint : SOL_MINT;

    const quoteResponse = await fetchJupiterQuote({
      inputMint,
      outputMint,
      amount: rawAmount,
    });

    const { swapTransaction } = await buildJupiterSwapTransaction({
      quoteResponse,
      userPublicKey,
    });

    return NextResponse.json({
      swapTransaction,
      quote: {
        inAmount: quoteResponse.inAmount,
        outAmount: quoteResponse.outAmount,
        inputMint: quoteResponse.inputMint,
        outputMint: quoteResponse.outputMint,
        priceImpactPct: quoteResponse.priceImpactPct ?? null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Swap preparation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
