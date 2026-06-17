/**
 * Shared utilities for the processing engine.
 */

/**
 * Parse page range strings like "1,3,5-7" into zero-indexed page numbers.
 * Returns sorted, deduplicated array of valid page indices.
 */
export function parsePageRanges(rangeStr: string, maxPages: number): number[] {
  const pages = new Set<number>();
  if (!rangeStr.trim()) return [];

  const parts = rangeStr.split(',');
  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr.trim());
      const end = parseInt(endStr.trim());
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          pages.add(i - 1); // Convert to 0-indexed
        }
      }
    } else {
      const p = parseInt(part.trim());
      if (!isNaN(p)) {
        pages.add(p - 1); // Convert to 0-indexed
      }
    }
  }

  // Filter valid pages and sort
  return Array.from(pages)
    .filter((p) => p >= 0 && p < maxPages)
    .sort((a, b) => a - b);
}
