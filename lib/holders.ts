import { Connection, PublicKey } from '@solana/web3.js';

export type TokenHolder = {
  rank: number;
  owner: string;
  amount: number;
  percent: number;
};

function getRpcUrl() {
  return process.env.NEXT_PUBLIC_SOLANA_RPC_URL!;
}

export async function fetchTopHolders(
  mintAddress: string,
  limit = 20
): Promise<TokenHolder[]> {
  const connection = new Connection(getRpcUrl());
  const mint = new PublicKey(mintAddress);

  const [largest, supply] = await Promise.all([
    connection.getTokenLargestAccounts(mint),
    connection.getTokenSupply(mint),
  ]);

  const totalSupply = Number(supply.value.uiAmount ?? 0);
  if (!largest.value.length || totalSupply <= 0) return [];

  const accounts = largest.value.slice(0, limit);
  const parsed = await connection.getMultipleParsedAccounts(
    accounts.map((a) => new PublicKey(a.address))
  );

  const holders: TokenHolder[] = [];

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const info = parsed.value[i];
    const ownerRaw =
      info?.data &&
      'parsed' in info.data &&
      info.data.parsed?.info?.owner
        ? info.data.parsed.info.owner
        : account.address;
    const owner = typeof ownerRaw === 'string' ? ownerRaw : ownerRaw.toBase58();

    const amount = account.uiAmount ?? 0;
    holders.push({
      rank: i + 1,
      owner,
      amount,
      percent: totalSupply > 0 ? (amount / totalSupply) * 100 : 0,
    });
  }

  return holders;
}
