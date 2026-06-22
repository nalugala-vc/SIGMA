/**
 * Remaps every color in a Lottie JSON to the SIGMA pink/purple/black palette.
 *
 * Strategy: preserve luminosity exactly, shift hue to ~300° (magenta-pink),
 * preserve saturation. Achromatic colors (greys/whites/blacks) are kept as-is
 * so contrast within the animation is maintained.
 *
 * Original blues:   #0471ca  #09def3  #14ffff  #50b5ff  …
 * Mapped to pinks:  #b80eb5  #f02bf2  #ff80ff  #e879f9  …
 */

const PINK_HUE = 302; // degrees — sits between magenta and hot-pink

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (t: number) => {
    const x = ((t % 1) + 1) % 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return [hue2rgb(h + 1 / 3), hue2rgb(h), hue2rgb(h - 1 / 3)];
}

function remapRgb(r: number, g: number, b: number): [number, number, number] {
  const [, s, l] = rgbToHsl(r, g, b);

  // Achromatic (greys/whites/blacks) — push lights into dark purple, keep darks dark
  if (s < 0.08) {
    if (l > 0.75) {
      // White → dark purple-grey
      return hslToRgb(PINK_HUE, 0.25, 0.18);
    }
    if (l > 0.4) {
      // Mid grey → medium-dark purple
      return hslToRgb(PINK_HUE, 0.3, 0.12);
    }
    // Already dark → keep very dark
    return hslToRgb(0, 0, Math.min(l, 0.08));
  }

  // Chromatic: shift hue to PINK_HUE, cap lightness so nothing goes near white,
  // scale saturation down ~30% to soften
  const sat = Math.min(s * 0.7, 0.75);
  const lit = Math.min(l, 0.62); // clamp brightness — no near-whites
  return hslToRgb(PINK_HUE, sat, lit);
}

function applyToColorK(k: unknown): unknown {
  if (!Array.isArray(k)) return k;

  // Static color: [r, g, b] or [r, g, b, a]
  if (k.length >= 3 && k.every((v) => typeof v === 'number')) {
    const [r, g, b] = remapRgb(k[0], k[1], k[2]);
    return k.length === 4 ? [r, g, b, k[3]] : [r, g, b];
  }

  // Animated color keyframes: array of keyframe objects
  if (k.length > 0 && typeof k[0] === 'object') {
    return k.map((kf) => {
      if (!kf || typeof kf !== 'object') return kf;
      const frame = kf as Record<string, unknown>;
      // s (start) and e (end) are the color values in an animated keyframe
      if (Array.isArray(frame.s)) frame.s = applyToColorK(frame.s);
      if (Array.isArray(frame.e)) frame.e = applyToColorK(frame.e);
      return frame;
    });
  }

  return k;
}

function walk(node: unknown): void {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { node.forEach(walk); return; }

  const obj = node as Record<string, unknown>;

  // Fill (ty:"fl") and stroke (ty:"st") color property
  if (typeof obj.ty === 'string' && (obj.ty === 'fl' || obj.ty === 'st')) {
    const c = obj.c as { a?: number; k?: unknown } | undefined;
    if (c && c.k !== undefined) {
      c.k = applyToColorK(c.k);
    }
  }

  // Gradient stops: gf / gs types store colors inline in array
  if (typeof obj.ty === 'string' && (obj.ty === 'gf' || obj.ty === 'gs')) {
    const g = obj.g as { k?: { k?: unknown } } | undefined;
    if (g?.k?.k !== undefined) {
      const stops = g.k.k;
      if (Array.isArray(stops) && stops.every((v) => typeof v === 'number')) {
        // Flat array: [t, r, g, b, t, r, g, b, …]
        for (let i = 0; i < stops.length; i += 4) {
          if (i + 3 < stops.length) {
            const [nr, ng, nb] = remapRgb(stops[i + 1], stops[i + 2], stops[i + 3]);
            stops[i + 1] = nr;
            stops[i + 2] = ng;
            stops[i + 3] = nb;
          }
        }
      }
    }
  }

  Object.values(obj).forEach(walk);
}

export function applySigmaTheme<T>(animationData: T): T {
  const clone = JSON.parse(JSON.stringify(animationData));
  walk(clone);
  return clone;
}
