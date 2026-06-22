'use client';

import { useEffect } from 'react';

/**
 * Privy/headlessui injects an inline `padding-right` on <body> when locking
 * scroll (to compensate for the disappearing scrollbar). Combined with
 * `scrollbar-gutter: stable` on <html> that space is already reserved, so the
 * injected padding causes a double-shift. This strips it immediately.
 */
export default function PrivyMobileModalFix() {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const pr = document.body.style.paddingRight;
      if (pr && pr !== '0px') {
        document.body.style.paddingRight = '0px';
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
