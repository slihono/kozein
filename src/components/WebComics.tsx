import { useEffect, useRef, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { language, t } from '../i18n';
import { webComics, type WebComic } from '../lib/webComics';
import { Button } from './ui/Button';

function ComicPage({ src, description }: { src: string; description: string }) {
  const [failed, setFailed] = useState(false);

  return <div className="flex min-h-52 justify-center rounded-lg bg-bg-deepest p-2 sm:p-4">
    {failed ? <p role="alert" className="self-center text-sm text-state-error">{t('reading.onlineError')}</p> :
      <img src={src} alt={description} referrerPolicy="no-referrer" className="max-h-[78vh] max-w-full object-contain"
        onError={() => setFailed(true)} />}
  </div>;
}

function ComicReader({ comic, close }: { comic: WebComic; close: () => void }) {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [page, setPage] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const chapter = comic.chapters[chapterIndex];
  const image = chapter.pages[page];
  const position = t('reading.position', { page: page + 1, total: chapter.pages.length });

  useEffect(() => {
    heading.current?.focus();
  }, []);

  return <article className="space-y-3 rounded-xl border border-border bg-bg-card p-3 sm:p-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 ref={heading} tabIndex={-1} className="text-lg font-semibold">{comic.title}</h3>
      <Button variant="neutral" size="sm" onClick={close}>{t('stream.close')}</Button>
    </div>
    <p className="flex flex-wrap items-center gap-x-2 text-xs text-text-secondary">
      <span>{comic.credit}</span>
      <a href={comic.licenseUrl} className="text-accent-300 underline">{comic.license}</a>
      <a href={comic.creditsUrl} className="text-accent-300 underline">{t('reading.onlineCredits')}</a>
      <a href={chapter.source} className="text-accent-300 underline">{t('reading.onlineSource')}</a>
    </p>
    {comic.nonCommercial && <p className="text-xs text-text-secondary">{t('reading.onlineNonCommercial')}</p>}
    <label className="flex flex-wrap items-center gap-2 text-sm">
      <span>{t('reading.onlineChapter')}</span>
      <select value={chapterIndex} className="min-w-0 max-w-full rounded-md border border-border bg-bg-input p-2"
        onChange={(event) => {
          setChapterIndex(Number(event.target.value));
          setPage(0);
        }}>
        {comic.chapters.map((entry, index) => <option key={entry.source} value={index}>
          {entry.title ? `${index + 1} · ${entry.title}` : index + 1}
        </option>)}
      </select>
    </label>
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="neutral" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
        {t('reading.previous')}
      </Button>
      <p aria-live="polite" className="text-sm text-text-secondary">{position}</p>
      <Button variant="neutral" size="sm" disabled={page + 1 === chapter.pages.length} onClick={() => setPage(page + 1)}>
        {t('reading.next')}
      </Button>
    </div>
    <ComicPage key={image} src={image} description={`${chapter.title ?? comic.title} · ${position}`} />
  </article>;
}

export function WebComics() {
  const [selected, setSelected] = useState<number | null>(null);
  const selectionHeading = useRef<HTMLHeadingElement>(null);
  const comics = webComics(language() === 'fr' ? 'fr' : 'en');

  return <section aria-labelledby="kozein-online-reading">
    <h2 id="kozein-online-reading" ref={selectionHeading} tabIndex={-1} className="mb-3 text-xl font-semibold">
      {t('reading.onlineTitle')}
    </h2>
    <ul className="mb-4 grid gap-2 sm:grid-cols-2">
      {comics.map((comic, index) => <li key={comic.title}>
        <button type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}
          className="flex min-h-16 w-full items-center gap-3 rounded-lg border border-border bg-bg-card px-3 py-2 text-start hover:bg-bg-input focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-400 aria-pressed:border-accent-400">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-bg-input text-accent-300">
            <BookOpen size={17} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-medium">{comic.title}</span>
            <span className="block text-xs text-text-muted">
              {t('reading.onlineEdition', { count: comic.chapters.length, language: t(`reading.onlineLanguage.${comic.language}`) })}
            </span>
          </span>
        </button>
      </li>)}
    </ul>
    {selected !== null && <ComicReader key={selected} comic={comics[selected]} close={() => {
      setSelected(null);
      selectionHeading.current?.focus();
    }} />}
  </section>;
}
