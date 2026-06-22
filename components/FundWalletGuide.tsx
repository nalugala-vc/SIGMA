export default function FundWalletGuide() {
  return (
    <ol className="list-decimal space-y-2 pl-4 text-sm text-zinc-400">
      <li>
        Copy your wallet address below — this is where you receive SOL.
      </li>
      <li>
        Buy SOL on an exchange (Coinbase, Kraken, Binance, etc.) or send from
        another wallet like Phantom.
      </li>
      <li>
        Withdraw or send to the <strong className="text-zinc-300">Solana</strong>{' '}
        network using your copied address.
      </li>
      <li>
        Wait ~1 minute, then refresh — your balance will update and you can buy
        tokens.
      </li>
    </ol>
  );
}
