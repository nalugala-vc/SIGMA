'use client';

import { applySigmaTheme } from '@/lib/lottie-sigma-theme';
import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';

const DEFAULT_URL = '/crypto-bitcoin.json';

export default function LandingLottie({ className }: { className?: string }) {
  const [animationData, setAnimationData] = useState<object | null>(null);

  const remoteUrl = process.env.NEXT_PUBLIC_LOTTIE_URL?.trim();

  useEffect(() => {
    let cancelled = false;

    async function loadFrom(url: string) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load animation from ${url}`);
      return res.json();
    }

    async function load() {
      const urls = remoteUrl ? [remoteUrl, DEFAULT_URL] : [DEFAULT_URL];

      for (const url of urls) {
        try {
          const raw = await loadFrom(url);
          if (!cancelled) setAnimationData(applySigmaTheme(raw));
          return;
        } catch {
          // try next URL (e.g. remote R2 miss → bundled public file)
        }
      }

      if (!cancelled) setAnimationData(null);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [remoteUrl]);

  if (!animationData) {
    return (
      <div
        className={`${className ?? ''} animate-pulse bg-gradient-to-br from-sigma/10 to-black`}
        aria-hidden
      />
    );
  }

  return (
    <Lottie
      animationData={animationData}
      loop
      className={className}
      aria-hidden
    />
  );
}
