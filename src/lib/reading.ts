/** Local comics use image files selected by the reader; no remote markup is accepted. */
export const READING_LIMITS = { pages: 600, pageBytes: 30 * 1024 * 1024, bookBytes: 350 * 1024 * 1024 };
export const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);

export interface ReadingPage {
  name: string;
  blob: Blob;
}

export interface ReadingBook {
  id: string;
  title: string;
  pages: ReadingPage[];
  page: number;
  updatedAt: number;
}

export function orderedImages<T extends { name: string; type: string; size: number }>(files: T[]): T[] {
  if (!files.length || files.length > READING_LIMITS.pages) throw new Error('reading.invalidPages');
  if (files.some((file) => !IMAGE_TYPES.has(file.type) || !Number.isSafeInteger(file.size) || file.size <= 0 || file.size > READING_LIMITS.pageBytes)) {
    throw new Error('reading.invalidImage');
  }
  if (files.reduce((sum, file) => sum + file.size, 0) > READING_LIMITS.bookBytes) throw new Error('reading.tooLarge');
  return [...files].sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true, sensitivity: 'base' }));
}

export function readingPage(value: number, total: number): number {
  return Math.min(Math.max(0, Math.trunc(Number.isFinite(value) ? value : 0)), Math.max(0, total - 1));
}

export function bookTitle(name: string): string {
  return name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim().slice(0, 150) || name.slice(0, 150);
}
