'use client';

import LandingLottie from '@/components/LandingLottie';
import SiteHeader from '@/components/SiteHeader';
import { useEffect } from 'react';

export default function LandingHero({ onGetStarted }: { onGetStarted: () => void }) {
  useEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  return (
    <div className="fixed inset-0 flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-black">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/4 translate-x-1/4 rounded-full bg-sigma/15 blur-[140px]" />
        <div className="absolute bottom-0 right-1/3 h-64 w-64 rounded-full bg-sigma-dark/20 blur-[100px]" />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <SiteHeader onSignIn={onGetStarted} authenticated={false} />

        <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-12">
          {/* Left: copy */}
          <div className="max-w-xl text-center lg:text-left">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Trade Solana&apos;s
              <br />
              wildest memecoins
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-400 sm:text-lg">
              Discover trending tokens, swap in one click, and track your portfolio —
              all on Solana with your wallet or Google account.
            </p>
            <button
              type="button"
              onClick={onGetStarted}
              className="mt-8 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Get started
            </button>
          </div>

          {/* Right: Lottie — contained, not full-height */}
          <div className="hero-glow relative mx-auto w-full max-w-[440px] shrink-0 sm:max-w-[520px] lg:mx-0 lg:max-w-[600px]">
            <LandingLottie className="h-auto w-full" />
          </div>
        </main>
      </div>
    </div>
  );
}
