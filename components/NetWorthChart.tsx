'use client';

import { formatCompactUsd } from '@/lib/format';

type Snapshot = {
  total_usd: number;
  recorded_at: string;
};

export default function NetWorthChart({
  currentTotal,
  snapshots,
}: {
  currentTotal: number;
  snapshots: Snapshot[];
}) {
  const points =
    snapshots.length > 0
      ? snapshots.map((s) => ({
          t: new Date(s.recorded_at).getTime(),
          v: Number(s.total_usd),
        }))
      : [{ t: Date.now(), v: currentTotal }];

  if (points.length === 1) {
    points.unshift({ t: points[0].t - 60_000, v: points[0].v });
  }

  const values = points.map((p) => p.v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const width = 320;
  const height = 120;
  const padding = 8;

  const coords = points.map((p, i) => {
    const x =
      padding +
      (i / Math.max(points.length - 1, 1)) * (width - padding * 2);
    const y =
      height -
      padding -
      ((p.v - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const line = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const area = `${padding},${height - padding} ${line} ${width - padding},${height - padding}`;

  const change =
    points.length >= 2
      ? ((points[points.length - 1].v - points[0].v) / Math.max(points[0].v, 0.01)) *
        100
      : 0;

  return (
    <div className="rounded-xl border border-zinc-800 p-4">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Net worth
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-white">
            {formatCompactUsd(currentTotal)}
          </p>
        </div>
        {snapshots.length >= 2 && (
          <p
            className={`text-sm font-medium tabular-nums ${
              change >= 0 ? 'text-sigma' : 'text-red-400'
            }`}
          >
            {change >= 0 ? '+' : ''}
            {change.toFixed(1)}%
          </p>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-32 w-full"
        role="img"
        aria-label="Net worth over time"
      >
        <defs>
          <linearGradient id="nw-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f02bf2" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f02bf2" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#nw-fill)" />
        <polyline
          points={line}
          fill="none"
          stroke="#f02bf2"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      {snapshots.length < 2 && (
        <p className="mt-2 text-xs text-zinc-500">
          Chart builds as you visit your profile and trade. Check back after a few visits.
        </p>
      )}
    </div>
  );
}
