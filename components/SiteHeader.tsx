'use client';

import SigmaLogo from '@/components/SigmaLogo';
import Link from 'next/link';

type NavLink = { href: string; label: string };

const PUBLIC_LINKS: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/profile', label: 'Profile' },
];

export default function SiteHeader({
  onSignIn,
  onSignOut,
  authenticated,
  userLabel,
}: {
  onSignIn?: () => void;
  onSignOut?: () => void;
  authenticated?: boolean;
  userLabel?: string;
}) {
  return (
    <header className="relative z-10 flex items-center justify-between gap-4 px-4 py-5 sm:px-8 lg:px-12">
      <SigmaLogo />

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
        {PUBLIC_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        {authenticated ? (
          <>
            {userLabel && (
              <span className="hidden max-w-[140px] truncate text-xs text-zinc-500 sm:inline">
                {userLabel}
              </span>
            )}
            <Link
              href="/profile"
              className="rounded-full border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white md:hidden"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-full border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
            >
              Log out
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onSignIn}
            className="rounded-full bg-sigma px-5 py-2 text-sm font-medium text-white shadow-[0_0_24px_rgba(240,43,242,0.35)] transition hover:bg-sigma-light"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
