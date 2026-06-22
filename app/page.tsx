'use client';

import TrendingList from '@/components/TrendingList';
import WalletPanel from '@/components/WalletPanel';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';

export default function Home() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-black px-4 text-white">
        <h1 className="text-3xl font-bold">SIGMA</h1>
        <p className="max-w-sm text-center text-zinc-400">
          Trade trending memecoins on Solana. Sign in with Google or connect
          your existing wallet (Phantom, etc.).
        </p>
        <button
          onClick={login}
          className="rounded-full bg-lime-400 px-6 py-3 font-bold text-black"
        >
          Sign in
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 bg-black px-4 py-8 text-white">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">SIGMA</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {user?.email?.address || user?.google?.email || 'Connected wallet'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/profile"
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            Profile
          </Link>
          <button
            onClick={logout}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            Log out
          </button>
        </div>
      </header>

      <WalletPanel />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Trending</h2>
        <TrendingList />
      </section>
    </main>
  );
}
