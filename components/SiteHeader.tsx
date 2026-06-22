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
}: {
  onSignIn?: () => void;
  onSignOut?: () => void;
  authenticated?: boolean;
  user?: User | null;
  userLabel?: string;
}) {
  return (
    <header className="relative z-10 flex items-center justify-between gap-4 px-4 py-5 sm:px-8 lg:px-12">
      <SigmaLogo />

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
