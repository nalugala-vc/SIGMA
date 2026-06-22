import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_BYTES = 2 * 1024 * 1024;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export function getR2Client() {
  const accountId = requireEnv('R2_ACCOUNT_ID');
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
    },
  });
}

export function publicObjectUrl(key: string): string {
  const base = requireEnv('R2_PUBLIC_URL').replace(/\/$/, '');
  return `${base}/${key}`;
}

export function validateAvatarFile(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Use a JPEG, PNG, WebP, or GIF image');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Image must be 2MB or smaller');
  }
}

export async function uploadAvatar(
  privyUserId: string,
  file: File
): Promise<string> {
  validateAvatarFile(file);

  const ext =
    file.type === 'image/jpeg'
      ? 'jpg'
      : file.type === 'image/png'
        ? 'png'
        : file.type === 'image/webp'
          ? 'webp'
          : 'gif';

  const key = `avatars/${privyUserId}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: requireEnv('R2_BUCKET_NAME'),
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  return publicObjectUrl(key);
}
