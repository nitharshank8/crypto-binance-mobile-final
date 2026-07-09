/** Format price based on magnitude */
export function formatPrice(price: number): string {
  if (price >= 1_000) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

/** K / M / B suffix */
export function formatVolume(vol: number): string {
  if (vol >= 1_000_000_000) return `${(vol / 1_000_000_000).toFixed(2)}B`;
  if (vol >= 1_000_000)     return `${(vol / 1_000_000).toFixed(2)}M`;
  if (vol >= 1_000)         return `${(vol / 1_000).toFixed(2)}K`;
  return vol.toFixed(2);
}

/** Signed percentage string */
export function formatPercent(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

export function formatSpread(spread: number): string {
  return spread.toFixed(4);
}

/** HH:MM:SS timestamp */
export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour12:  false,
    hour:    '2-digit',
    minute:  '2-digit',
    second:  '2-digit',
  });
}
