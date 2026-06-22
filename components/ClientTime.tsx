'use client';

import { useEffect, useState } from 'react';

/** Renders a locale time string only after mount to avoid hydration mismatch. */
export default function ClientTime({ date }: { date: Date | null }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    if (date) setText(date.toLocaleTimeString());
  }, [date]);

  if (!text) return null;
  return <>{text}</>;
}
