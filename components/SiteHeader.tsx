'use client';

import ProfileMenu from '@/components/ProfileMenu';
import SigmaLogo from '@/components/SigmaLogo';
import type { User } from '@privy-io/react-auth';

export default function SiteHeader({
  onSignIn,
  onSignOut,
  authenticated,
  user,
  userLabel,
  landing,
}: {
  onSignIn?: () => void;
  onSignOut?: () => void;
  authenticated?: boolean;
  user?: User | null;
  userLabel?: string;
  landing?: boolean;
}) {
  return (
    <header
      className={`relative z-10 flex shrink-0 items-center justify-between gap-4 px-4 sm:px-8 lg:px-12 ${
        landing ? 'py-3 sm:py-4' : 'py-5'
      }`}
    >
      <SigmaLogo size={landing ? 'sm' : 'md'} compact={landing} />

      {landing && onSignIn && (
        <button
          type="button"
          onClick={onSignIn}
          className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200 sm:px-5 sm:py-2 sm:text-sm lg:hidden"
        >
          Get started
        </button>
      )}

      {authenticated && userLabel && onSignOut && (
        <ProfileMenu
          user={user ?? null}
          userLabel={userLabel}
          onLogout={onSignOut}
        />
      )}
    </header>
  );
}
