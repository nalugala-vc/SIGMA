'use client';

import ProfileAvatar from '@/components/ProfileAvatar';
import type { User } from '@privy-io/react-auth';
import { useRef, useState, useEffect } from 'react';

export default function AvatarUpload({
  privyUserId,
  user,
  userLabel,
  avatarUrl,
  onUploaded,
}: {
  privyUserId: string;
  user: User | null;
  userLabel: string;
  avatarUrl: string | null;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl);

  useEffect(() => {
    setPreview(avatarUrl);
  }, [avatarUrl]);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('privyUserId', privyUserId);

    try {
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setPreview(data.avatarUrl);
      onUploaded(data.avatarUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <ProfileAvatar
        user={user}
        userLabel={userLabel}
        avatarUrl={preview}
        size="lg"
      />

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900 disabled:opacity-60"
        >
          {uploading ? 'Uploading…' : 'Change photo'}
        </button>
        <p className="mt-2 text-xs text-zinc-500">
          Stored on Cloudflare R2 · JPEG, PNG, WebP, GIF · max 2MB
        </p>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}
