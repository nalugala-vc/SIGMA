import type { User } from '@privy-io/react-auth';

export function getProfileInitials(user: User | null, label: string): string {
  const name = user?.google?.name || user?.email?.address || label;
  if (!name || name === 'Connected wallet') return 'Σ';
  if (name.includes('@')) return name[0].toUpperCase();
  const parts = name.trim().split(/\s+/);
  return parts
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
