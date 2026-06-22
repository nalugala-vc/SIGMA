'use client';

import LandingLottie from '@/components/LandingLottie';
import SiteHeader from '@/components/SiteHeader';

export default function LandingHero({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="fixed inset-0 flex h-dvh flex-col overflow-hidden bg-black">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/4 translate-x-1/4 rounded-full bg-sigma/15 blur-[140px]" />
        <div className="absolute bottom-0 right-1/3 h-64 w-64 rounded-full bg-sigma-dark/20 blur-[100px]" />
      </div>

      {/* Header floats over the content so it doesn't offset vertical centering */}
      <div className="absolute inset-x-0 top-0 z-20">
        <SiteHeader onSignIn={onGetStarted} authenticated={false} landing />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-hidden px-4 pb-6 sm:px-8 sm:pb-8 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-12 lg:pb-0">
          {/* Copy — small top offset so it clears the floating header on short screens */}
          <div className="w-full max-w-xl shrink-0 text-center lg:text-left" style={{ marginTop: 'clamp(0px, 8vh, 40px)' }}>
            <h1 className="text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-white sm:text-4xl sm:leading-tight lg:text-[3.25rem] lg:leading-[1.1]">
              Trade Solana&apos;s
              <br />
              wildest memecoins
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-400 sm:mt-5 sm:text-base lg:mx-0 lg:max-w-none lg:text-lg">
              Discover trending tokens, swap in one click, and track your portfolio —
              all on Solana with your wallet or Google account.
            </p>
            <button
              type="button"
              onClick={onGetStarted}
              className="mt-6 hidden rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 lg:inline-block lg:mt-8"
            >
              Get started
            </button>
          </div>

          {/* Lottie — sized to fill remaining space, not exceed it */}
          <div className="hero-glow flex min-h-0 w-full shrink items-center justify-center lg:max-w-[600px] lg:-translate-y-6">
            <LandingLottie className="h-auto max-h-[45vw] w-full max-w-[260px] sm:max-h-[300px] sm:max-w-[340px] lg:max-h-none lg:max-w-none" />
          </div>
        </main>
      </div>
    </div>
  );
}
