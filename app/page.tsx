'use client';

import LandingHero from '@/components/LandingHero';
import ScrollUnlock from '@/components/ScrollUnlock';
import SiteHeader from '@/components/SiteHeader';
import TrendingList from '@/components/TrendingList';
import WalletPanel from '@/components/WalletPanel';
import { usePrivy } from '@privy-io/react-auth';

export default function Home() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="h-8 w-8 animate-pulse rounded-full border border-sigma/40 bg-sigma/10" />
      </div>
    );
  }

  if (!authenticated) {
    return <LandingHero onGetStarted={login} />;
  }

  const userLabel =
    user?.email?.address || user?.google?.email || 'Connected wallet';

  return (
    <div className="flex min-h-dvh flex-col bg-black text-white">
      <ScrollUnlock />
      <SiteHeader
        authenticated
        user={user}
        userLabel={userLabel}
        onSignOut={logout}
      />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-8">
        <WalletPanel />

        <section id="trending">
          <h2 className="mb-3 text-lg font-semibold">Trending</h2>
          <TrendingList />
        </section>
      </main>
    </div>
  );
}
