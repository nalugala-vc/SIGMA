'use client';

import { getProfileInitials } from '@/lib/profile-avatar';
import type { User } from '@privy-io/react-auth';

const SIZES = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-20 w-20 text-xl',
  lg: 'h-24 w-24 text-2xl',
};

export default function ProfileAvatar({
  user,
  userLabel,
  avatarUrl,
  size = 'sm',
}: {
  user: User | null;
  userLabel: string;
  avatarUrl?: string | null;
  size?: keyof typeof SIZES;
}) {
  const initials = getProfileInitials(user, userLabel);
  const className = `${SIZES[size]} shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-gradient-to-br from-zinc-800 to-zinc-900 font-semibold text-white`;

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`${className} object-cover`}
      />
    );
  }

  return (
    <span className={`${className} flex items-center justify-center`}>
      {initials}
    </span>
  );
}
