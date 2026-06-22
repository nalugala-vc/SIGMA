'use client';

import SiteHeader from '@/components/SiteHeader';
import Image from 'next/image';
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
      {/* Full-height animation — right side, covers entire viewport height */}
      <div className="absolute inset-0 lg:left-[38%]" aria-hidden>
        <Image
          src="/animation.gif"
          alt=""
          fill
          unoptimized
          priority
          className="hero-glow object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/20 lg:from-black lg:via-black/70 lg:to-transparent" />
      </div>

      {/* Ambient pink glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-sigma/15 blur-[120px]" />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <SiteHeader onSignIn={onGetStarted} authenticated={false} />

        <main className="flex min-h-0 flex-1 items-center px-4 sm:px-8 lg:px-12">
          <div className="max-w-lg">
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
        </main>
      </div>
    </div>
  );
}
