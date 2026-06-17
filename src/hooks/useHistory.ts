import { useState, useCallback, useEffect } from 'react';
import type { HistoryEntry } from '../config/types';

const STORAGE_KEY = 'turboconverter_history';
const MAX_ENTRIES = 20;

// In-memory map of entryId → blobUrl for re-download during current session
const sessionBlobUrls = new Map<string, string>();

/**
 * Reads history entries from localStorage, sorted by timestamp (newest first).
 */
export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const entries: HistoryEntry[] = JSON.parse(raw);
    // Attach session blob URLs if still available
    return entries
      .map((entry) => ({
        ...entry,
        resultBlobUrl: sessionBlobUrls.get(entry.id) ?? undefined,
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

/**
 * Adds a history entry to localStorage with FIFO eviction at 20 entries.
 * If a blobUrl is provided, stores it in the in-memory session map.
 */
export function addHistoryEntry(
  entry: Omit<HistoryEntry, 'resultBlobUrl'>,
  blobUrl?: string
): void {
  if (blobUrl) {
    sessionBlobUrls.set(entry.id, blobUrl);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const entries: Omit<HistoryEntry, 'resultBlobUrl'>[] = raw
      ? JSON.parse(raw)
      : [];

    entries.push({
      id: entry.id,
      toolId: entry.toolId,
      toolName: entry.toolName,
      fileName: entry.fileName,
      timestamp: entry.timestamp,
    });

    // FIFO eviction: keep only the most recent MAX_ENTRIES
    while (entries.length > MAX_ENTRIES) {
      const removed = entries.shift();
      if (removed) {
        // Revoke the blob URL for evicted entries if it exists in session
        const evictedUrl = sessionBlobUrls.get(removed.id);
        if (evictedUrl) {
          URL.revokeObjectURL(evictedUrl);
          sessionBlobUrls.delete(removed.id);
        }
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage may be full or unavailable — silently fail
  }
}

/**
 * Clears all history entries from localStorage and revokes all session blob URLs.
 */
function clearAllHistory(): void {
  // Revoke all blob URLs in the session map
  for (const url of sessionBlobUrls.values()) {
    URL.revokeObjectURL(url);
  }
  sessionBlobUrls.clear();

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently fail
  }
}

/**
 * React hook for managing conversion history.
 * Provides reactive state that updates when entries are added or cleared.
 */
export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => getHistory());

  // Sync state from localStorage on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const addEntry = useCallback(
    (entry: Omit<HistoryEntry, 'resultBlobUrl'>, blobUrl?: string) => {
      addHistoryEntry(entry, blobUrl);
      setHistory(getHistory());
    },
    []
  );

  const clearHistory = useCallback(() => {
    clearAllHistory();
    setHistory([]);
  }, []);

  const refreshHistory = useCallback(() => {
    setHistory(getHistory());
  }, []);

  return {
    history,
    addEntry,
    clearHistory,
    refreshHistory,
  };
}
