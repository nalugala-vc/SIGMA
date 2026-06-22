'use client';

import { useSyncUser } from '@/hooks/useSyncUser';

/** Runs profile sync app-wide after login (wallet, Google, email). */
export default function SyncUser() {
  useSyncUser();
  return null;
}
