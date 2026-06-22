'use client';

import ProfileAvatar from '@/components/ProfileAvatar';
import { useUserProfile } from '@/hooks/useUserProfile';
import type { User } from '@privy-io/react-auth';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function ProfileMenu({
  user,
  userLabel,
  onLogout,
}: {
  user: User | null;
  userLabel: string;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { avatarUrl, refresh } = useUserProfile(user?.id);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('sigma:profile-updated', handler);
    return () => window.removeEventListener('sigma:profile-updated', handler);
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-sigma/40"
        aria-label="Account menu"
        aria-expanded={open}
      >
        <ProfileAvatar
          user={user}
          userLabel={userLabel}
          avatarUrl={avatarUrl}
          size="sm"
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 py-1 shadow-xl">
          <p className="truncate border-b border-zinc-800 px-4 py-2 text-xs text-zinc-500">
            {userLabel}
          </p>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
          >
            Profile
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="block w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
