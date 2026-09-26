// Keep embed headlines compact: previews have limited room for the main line.
export function embedTitle(title: string, maxLength = 70): string {
  const normalized = title.trim().replace(/\s+/g, ' ');
  if (normalized.length <= maxLength) return normalized;

  const available = maxLength - 1; // Reserve space for the ellipsis.
  const prefix = normalized.slice(0, available + 1);
  const lastSpace = prefix.lastIndexOf(' ');
  return (lastSpace > 0 ? prefix.slice(0, lastSpace) : normalized.slice(0, available)) + '…';
}
