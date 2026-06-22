type DexScreenerChartProps = {
  pairAddress: string;
};

export default function DexScreenerChart({ pairAddress }: DexScreenerChartProps) {
  const embedUrl = `https://dexscreener.com/solana/${pairAddress}?embed=1&theme=dark&trades=1&info=0`;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <iframe
        src={embedUrl}
        title="Price chart"
        className="h-[600px] w-full border-0 sm:h-[680px]"
        allow="clipboard-write"
      />
    </div>
  );
}
