export default function FundWalletGuide() {
  return (
    <ol className="list-decimal space-y-2 pl-4 text-sm text-zinc-400">
      <li>
        Scan the QR code or copy your wallet address — this is where you receive
        SOL.
      </li>
      <li>
        <strong className="text-zinc-300">Buy with card</strong> above, or send
        SOL from Phantom / an exchange (Coinbase, Kraken, Binance, etc.).
      </li>
      <li>
        Always use the <strong className="text-zinc-300">Solana</strong> network
        when withdrawing.
      </li>
      <li>
        Wait ~1 minute, then refresh your balance — you can start trading.
      </li>
    </ol>
  );
}
