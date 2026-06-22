'use client';

import { applySigmaTheme } from '@/lib/lottie-sigma-theme';
import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';

const DEFAULT_URL = '/crypto-bitcoin.json';

export default function LandingLottie({ className }: { className?: string }) {
  const [animationData, setAnimationData] = useState<object | null>(null);

  const lottieUrl =
    process.env.NEXT_PUBLIC_LOTTIE_URL?.trim() || DEFAULT_URL;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(lottieUrl);
        if (!res.ok) throw new Error('Failed to load animation');
        const raw = await res.json();
        if (!cancelled) setAnimationData(applySigmaTheme(raw));
      } catch {
        if (!cancelled) setAnimationData(null);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [lottieUrl]);

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
