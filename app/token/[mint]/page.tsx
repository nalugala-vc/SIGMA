import TokenDetail from '@/components/TokenDetail';
import { fetchTokenByMint } from '@/lib/dexscreener';
import { notFound } from 'next/navigation';

export default async function TokenPage({
  params,
}: {
  params: Promise<{ mint: string }>;
}) {
  const { mint } = await params;
  const token = await fetchTokenByMint(mint);

  if (!token) {
    notFound();
  }

  return <TokenDetail mint={mint} initialToken={token} />;
}
