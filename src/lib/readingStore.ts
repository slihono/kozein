import type { ReadingBook } from './reading';
import { readingPage } from './reading';

/** IndexedDB stores the image bytes, so a saved volume reopens after a restart, offline. */
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kozein-reading', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('books', { keyPath: 'id' });
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('reading.storageBlocked'));
    request.onsuccess = () => resolve(request.result);
  });
}

async function transaction<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('books', mode);
    const request = operation(tx.objectStore('books'));
    tx.oncomplete = () => { db.close(); resolve(request.result); };
    tx.onabort = () => { db.close(); reject(tx.error ?? request.error ?? new Error('reading.storageError')); };
    tx.onerror = () => { db.close(); reject(tx.error ?? request.error); };
  });
}

export async function readingBooks(): Promise<ReadingBook[]> {
  const books = await transaction('readonly', (store) => store.getAll());
  return (books as ReadingBook[]).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function saveBook(book: ReadingBook): Promise<void> {
  await transaction('readwrite', (store) => store.put(book));
}

/** Change only the position in the latest record, so another window cannot restore older pages. */
export async function saveReadingPosition(id: string, page: number): Promise<void> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('books', 'readwrite');
    const store = tx.objectStore('books');
    const request = store.get(id);
    request.onsuccess = () => {
      const book = request.result as ReadingBook | undefined;
      if (book) store.put({ ...book, page: readingPage(page, book.pages.length), updatedAt: Date.now() });
    };
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onabort = () => { db.close(); reject(tx.error ?? new Error('reading.storageError')); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function removeBook(id: string): Promise<void> {
  await transaction('readwrite', (store) => store.delete(id));
}
