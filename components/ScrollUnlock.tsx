'use client';

import { useEffect } from 'react';

/** Re-enables page scroll for routes that aren't the fixed landing page. */
export default function ScrollUnlock() {
  useEffect(() => {
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);
  return null;
}
