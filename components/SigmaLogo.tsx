import Link from 'next/link';

export default function SigmaLogo({
  href = '/',
  size = 'md',
  compact = false,
}: {
  href?: string;
  size?: 'sm' | 'md';
  compact?: boolean;
}) {
  const iconSize = size === 'sm' ? 'h-8 w-8 text-sm' : 'h-9 w-9 text-base';
  const labelSize = size === 'sm' ? 'text-base' : 'text-lg';

  return (
    <Link href={href} className="flex items-center gap-2.5">
      <span
        className={`logo-glow flex ${iconSize} shrink-0 items-center justify-center rounded-full border border-sigma/40 bg-black font-serif font-bold text-sigma`}
        aria-hidden
      >
        Σ
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span className={`${labelSize} font-semibold tracking-tight text-white`}>
          SIGMA
        </span>
        <span
          className={`mt-0.5 text-[10px] font-medium tracking-widest text-sigma/70 uppercase ${
            compact ? 'hidden sm:block' : ''
          }`}
        >
          don&apos;t be mid
        </span>
      </span>
    </Link>
  );
}
