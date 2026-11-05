import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, FilePlus2, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { bookTitle, orderedImages, readingPage, type ReadingBook } from '../lib/reading';
import { readingBooks, removeBook, saveBook, saveReadingPosition } from '../lib/readingStore';
import { isKey, t } from '../i18n';

function useBlobUrl(blob: Blob | undefined): string | undefined {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!blob) { setUrl(undefined); return; }
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);
  return url;
}

const BookCover: React.FC<{ book: ReadingBook }> = ({ book }) => {
  const url = useBlobUrl(book.pages[0]?.blob);
  return <img src={url} alt="" className="aspect-[2/3] w-full rounded-lg bg-bg-elevated object-cover" loading="lazy" />;
};

export const Reading: React.FC = () => {
  const [books, setBooks] = useState<ReadingBook[]>([]);
  const [active, setActive] = useState<ReadingBook | null>(null);
  const [page, setPage] = useState(0);
  const [rtl, setRtl] = useState(true);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [removeId, setRemoveId] = useState<string | null>(null);
  const picker = useRef<HTMLInputElement>(null);
  const imageUrl = useBlobUrl(active?.pages[page]?.blob);

  const report = (err: unknown) => {
    const key = err instanceof Error ? err.message : '';
    setError(isKey(key) ? t(key) : t('reading.storageError'));
  };
  useEffect(() => {
    let cancelled = false;
    readingBooks().then((data) => { if (!cancelled) setBooks(data); })
      .catch((err: unknown) => { if (!cancelled) report(err); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, []);

  const go = (next: number) => {
    if (!active) return;
    const position = readingPage(next, active.pages.length);
    setPage(position);
    setBooks((current) => current.map((book) => book.id === active.id ? { ...book, page: position, updatedAt: Date.now() } : book));
    void saveReadingPosition(active.id, position).catch(report);
  };
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && /INPUT|SELECT|TEXTAREA/.test(target.tagName)) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        go(page + ((event.key === 'ArrowRight') !== rtl ? 1 : -1));
      }
      if (event.key === 'Escape') setActive(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const importPages = async (files: File[]) => {
    if (!files.length) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const sorted = orderedImages(files);
      // Decode before saving. A renamed executable or an invalid image cannot become a volume.
      for (const file of sorted) {
        const bitmap = await createImageBitmap(file);
        if (bitmap.width * bitmap.height > 80_000_000) { bitmap.close(); throw new Error('reading.invalidImage'); }
        bitmap.close();
      }
      const book: ReadingBook = {
        id: crypto.randomUUID(), title: bookTitle(sorted[0].name),
        pages: sorted.map((file) => ({ name: file.name, blob: file })), page: 0, updatedAt: Date.now(),
      };
      await saveBook(book);
      setBooks((current) => [book, ...current]);
      setNotice(t('reading.imported', { title: book.title }));
    } catch (err) { report(err); }
    finally { setBusy(false); if (picker.current) picker.current.value = ''; }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-300">{t('kozein.brand')}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{active?.title ?? t('reading.title')}</h1>
          <p className="mt-1 max-w-2xl text-sm text-text-secondary">{t(active ? 'reading.shortcuts' : 'reading.hint')}</p>
        </div>
        {active ? (
          <Button onClick={() => setActive(null)}><ArrowLeft size={16} aria-hidden="true" />{t('reading.back')}</Button>
        ) : (
          <Button variant="primary" onClick={() => picker.current?.click()} disabled={busy}>
            <FilePlus2 size={16} aria-hidden="true" />{t(busy ? 'common.loading' : 'reading.import')}
          </Button>
        )}
        <input ref={picker} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" multiple className="hidden"
          aria-label={t('reading.import')} onChange={(event) => void importPages(Array.from(event.target.files ?? []))} />
      </header>
      {error && <div role="alert" className="rounded-lg border border-state-error/40 bg-state-error/10 p-4 text-sm text-state-error">{error}</div>}
      {notice && <p role="status" className="text-sm text-text-secondary">{notice}</p>}
      {active ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-bg-card p-3">
            <div className="flex items-center gap-3">
              <Button icon aria-label={t('reading.previous')} disabled={page === 0} onClick={() => go(page - 1)}><ChevronLeft size={18} /></Button>
              <label className="flex items-center gap-2 text-sm">
                {t('reading.page')}
                <select aria-label={t('reading.page')} className="rounded-md border border-border bg-bg-input p-2 text-text-primary" value={page} onChange={(event) => go(Number(event.target.value))}>
                  {active.pages.map((_, index) => <option key={index} value={index}>{index + 1}</option>)}
                </select>
                <span className="text-text-muted">/ {active.pages.length}</span>
              </label>
              <Button icon aria-label={t('reading.next')} disabled={page === active.pages.length - 1} onClick={() => go(page + 1)}><ChevronRight size={18} /></Button>
            </div>
            <label className="flex items-center gap-2 text-sm text-text-secondary"><input type="checkbox" checked={rtl} onChange={(event) => setRtl(event.target.checked)} />{t('reading.rtl')}</label>
          </div>
          <p className="sr-only" aria-live="polite">{t('reading.position', { page: page + 1, total: active.pages.length })}</p>
          <div className="flex min-h-60 justify-center rounded-xl bg-bg-deepest p-2 sm:p-5">
            <img key={imageUrl} src={imageUrl} alt={t('reading.position', { page: page + 1, total: active.pages.length })}
              className="max-h-[78vh] max-w-full object-contain" onError={() => setError(t('reading.invalidImage'))} />
          </div>
        </>
      ) : busy ? <p role="status" className="py-16 text-center text-text-muted">{t('common.loading')}</p> : books.length ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-7">
          {books.map((book) => (
            <article key={book.id} className="min-w-0">
              <button className="group w-full rounded-lg text-start" onClick={() => { setActive(book); setPage(book.page); setNotice(''); setError(''); }} aria-label={t('reading.open', { title: book.title })}>
                <BookCover book={book} />
                <h2 className="mt-3 break-words text-sm font-semibold group-hover:text-accent-300">{book.title}</h2>
                <p className="mt-1 text-xs text-text-muted">{t('reading.position', { page: book.page + 1, total: book.pages.length })}</p>
              </button>
              <div className="mt-2 flex flex-wrap gap-1">
                {removeId === book.id ? <>
                  <Button variant="danger" size="sm" onClick={() => {
                    void removeBook(book.id).then(() => { setBooks((current) => current.filter((item) => item.id !== book.id)); setRemoveId(null); }).catch(report);
                  }}>{t('reading.confirmRemove')}</Button>
                  <Button variant="ghost" size="sm" onClick={() => setRemoveId(null)}>{t('common.cancel')}</Button>
                </> : <Button variant="ghost" size="sm" aria-label={t('reading.remove', { title: book.title })} onClick={() => setRemoveId(book.id)}><Trash2 size={14} aria-hidden="true" />{t('reading.delete')}</Button>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
          <BookOpen size={40} aria-hidden="true" className="mb-5 text-accent-300" />
          <h2 className="text-lg font-semibold">{t('reading.empty')}</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-text-secondary">{t('reading.emptyHint')}</p>
          <Button className="mt-6" onClick={() => picker.current?.click()}>{t('reading.import')}</Button>
        </section>
      )}
    </div>
  );
};
