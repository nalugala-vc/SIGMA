import Link from 'next/link';

export default function SigmaLogo({
  href = '/',
  size = 'md',
}: {
  href?: string;
  size?: 'sm' | 'md';
}) {
  const iconSize = size === 'sm' ? 'h-8 w-8 text-sm' : 'h-9 w-9 text-base';
  const labelSize = size === 'sm' ? 'text-base' : 'text-lg';

  return (
    <Link href={href} className="flex items-center gap-2.5">
      <span
        className={`logo-glow flex ${iconSize} items-center justify-center rounded-full border border-sigma/40 bg-black font-serif font-bold text-sigma`}
        aria-hidden
      >
        Σ
      </span>
      <span className="flex flex-col leading-none">
        <span className={`${labelSize} font-semibold tracking-tight text-white`}>
          SIGMA
        </span>
        <span className="mt-0.5 text-[10px] font-medium tracking-widest text-sigma/70 uppercase">
          don&apos;t be mid
        </span>
      </span>
    </Link>
  );
}
