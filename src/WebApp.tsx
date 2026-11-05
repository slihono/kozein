import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, Bookmark, Check, ChevronRight, Compass, ExternalLink, Film, FolderOpen, Play, Plus, Search, Settings, Share2, Star, X } from 'lucide-react';
import { Button } from './components/ui/Button';
import { Modal } from './components/ui/Modal';
import { Reading } from './screens/Reading';
import { t, applyLanguageSetting, language, useLocale } from './i18n';
import { applyTheme, currentTheme, THEMES, type ThemeId } from './theme/themes';
import { safeCatalogueLink, storedWatchlist, fetchCatalogue, type CatalogueTitle } from './lib/webCatalogue';
import './theme/kozein.css';

type Tab = 'discover' | 'library' | 'reading' | 'video' | 'settings';
const TABS = ['discover', 'library', 'reading', 'video', 'settings'] as const;
const ICONS = { discover: Compass, library: Bookmark, reading: BookOpen, video: Film, settings: Settings };
const LIST_KEY = 'kozein-watchlist';

function currentTab(): Tab {
  const value = location.hash.slice(2);
  return TABS.find((tab) => tab === value) ?? 'discover';
}

const LocalVideo: React.FC = () => {
  const picker = useRef<HTMLInputElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const lastSaved = useRef(0);
  const key = file ? `kozein-video:${file.name}:${file.size}:${file.lastModified}` : '';

  useEffect(() => {
    if (!file) return;
    const next = URL.createObjectURL(file);
    setUrl(next); lastSaved.current = 0;
    return () => URL.revokeObjectURL(next);
  }, [file]);

  const save = () => {
    if (!video.current || !key) return;
    try { localStorage.setItem(key, String(video.current.currentTime)); }
    catch { setError(t('web.storageError')); }
  };

  return <div className="flex flex-col gap-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-semibold">{t('web.video')}</h1><p className="mt-2 text-sm text-text-secondary">{t('web.videoHint')}</p></div>
      <Button variant="primary" onClick={() => picker.current?.click()}><FolderOpen size={16} />{t('web.openVideo')}</Button>
      <input type="file" ref={picker} accept="video/*,.mkv" className="hidden" aria-label={t('web.openVideo')} onChange={(event) => {
        save(); setError(''); setFile(event.target.files?.[0] ?? null); event.target.value = '';
      }} />
    </div>
    {error && <p role="alert" className="text-state-error">{error}</p>}
    {file ? <>
      <h2 className="break-words text-sm text-text-secondary">{file.name}</h2>
      <video key={url} ref={video} src={url} controls playsInline className="max-h-[70vh] w-full rounded-xl bg-bg-deepest"
        onLoadedMetadata={() => {
          try {
            const position = Number(localStorage.getItem(key));
            const player = video.current;
            if (player && Number.isFinite(position) && position > 0 && position < player.duration - 5) player.currentTime = position;
          } catch { setError(t('web.storageError')); }
        }}
        onTimeUpdate={() => { if (Date.now() - lastSaved.current > 5000) { save(); lastSaved.current = Date.now(); } }}
        onPause={save} onEnded={save} onError={() => setError(t('web.videoError'))} />
    </> : <div className="kozein-empty">
      <Film size={42} aria-hidden="true" /><h2>{t('web.videoEmpty')}</h2><p>{t('web.videoHint')}</p>
      <Button onClick={() => picker.current?.click()}><Plus size={16} />{t('web.openVideo')}</Button>
    </div>}
  </div>;
};

export const WebApp: React.FC = () => {
  useLocale();
  const [tab, setTab] = useState<Tab>(currentTab);
  const [query, setQuery] = useState('');
  const [titles, setTitles] = useState<CatalogueTitle[]>([]);
  const [selected, setSelected] = useState<CatalogueTitle | null>(null);
  const [list, setList] = useState<CatalogueTitle[]>(() => {
    try { return storedWatchlist(localStorage.getItem(LIST_KEY)); }
    catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [storageError, setStorageError] = useState('');
  const [stale, setStale] = useState(false);
  const [retry, setRetry] = useState(0);
  const [notice, setNotice] = useState('');
  const [theme, setTheme] = useState<ThemeId>(currentTheme);
  const headingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const change = () => { setTab(currentTab()); setSelected(null); setNotice(''); };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [tab]);

  useEffect(() => {
    if (tab !== 'discover') return;
    const controller = new AbortController();
    setLoading(true); setError(''); setStale(false);
    const timer = setTimeout(() => {
      const cacheKey = `kozein-catalogue:${query.trim().toLowerCase()}`;
      void fetchCatalogue(query, controller.signal).then((data) => {
        if (controller.signal.aborted) return;
        setTitles(data);
        // Cache only the last successful search to bound browser storage.
        try { localStorage.setItem('kozein-catalogue-cache', JSON.stringify({ key: cacheKey, data })); }
        catch { setNotice(t('web.cacheUnavailable')); }
      }).catch(() => {
        if (controller.signal.aborted) return;
        let cached: CatalogueTitle[] = [];
        try {
          const saved = JSON.parse(localStorage.getItem('kozein-catalogue-cache') ?? 'null') as { key: string; data: unknown } | null;
          if (saved?.key === cacheKey) cached = storedWatchlist(JSON.stringify(saved.data));
        } catch { setNotice(t('web.cacheUnavailable')); }
        setTitles(cached); setStale(cached.length > 0); setError(t('web.catalogueError'));
      }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, query ? 400 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, retry, tab]);

  const navigate = (next: Tab) => { location.hash = `/${next}`; setTab(next); };
  const toggleList = (title: CatalogueTitle) => {
    const exists = list.some((item) => item.id === title.id);
    const next = exists ? list.filter((item) => item.id !== title.id) : [title, ...list];
    try {
      localStorage.setItem(LIST_KEY, JSON.stringify(next)); setList(next); setStorageError('');
      setNotice(t(exists ? 'web.removed' : 'web.saved', { title: title.title }));
    } catch { setStorageError(t('web.storageError')); }
  };

  const cards = tab === 'library' ? list : titles;
  const selectedSaved = selected ? list.some((item) => item.id === selected.id) : false;

  return <div className="kozein-app">
    <a href="#kozein-main" className="kozein-skip">{t('web.skipContent')}</a>
    <aside className="kozein-sidebar">
      <a className="kozein-brand" href="#/discover" aria-label={t('kozein.brand')}>
        <img src="./kozein.svg" width="38" height="38" alt="" />
        <span>{t('kozein.brand')}<small>{t('web.personalSpace')}</small></span>
      </a>
      <p className="kozein-nav-label">{t('web.explore')}</p>
      <nav aria-label={t('sidebar.mainNav')}>
        {TABS.map((item) => {
          const Icon = ICONS[item];
          return <a href={`#/${item}`} key={item} aria-current={tab === item ? 'page' : undefined} className={tab === item ? 'active' : ''}>
            <Icon size={19} aria-hidden="true" /><span>{t(`web.${item}`)}</span>{item === 'library' && list.length > 0 && <small>{list.length}</small>}
          </a>;
        })}
      </nav>
      <div className="kozein-owner"><span className="kozein-owner-mark">{t('kozein.initial')}</span><span>{t('kozein.brand')}<small>{t('web.localProfile')}</small></span></div>
    </aside>
    <div className="kozein-content">
      <header className="kozein-topbar">
        <p>{t('web.workspace')}<ChevronRight size={13} aria-hidden="true" /><span>{t(`web.${tab}`)}</span></p>
        <div className="flex items-center gap-2">
          <span className="kozein-local-dot" aria-hidden="true" /><span className="text-xs text-text-muted">{t('web.localData')}</span>
          <select aria-label={t('web.language')} className="rounded-md border border-border bg-bg-input p-2 text-xs text-text-primary" value={language() === 'fr' ? 'fr' : 'en'} onChange={(event) => void applyLanguageSetting(event.target.value)}>
            <option value="fr">Français</option><option value="en">English</option>
          </select>
        </div>
      </header>
      <main id="kozein-main" ref={headingRef} tabIndex={-1} className="kozein-main">
        {(storageError || notice) && <p role={storageError ? 'alert' : 'status'} className={`kozein-notice ${storageError ? 'text-state-error' : 'text-text-secondary'}`}>{storageError || notice}</p>}
        {(tab === 'discover' || tab === 'library') && <>
          {tab === 'library' && <h1 className="sr-only">{t('web.libraryTitle')}</h1>}
          {tab === 'discover' && <section className="kozein-welcome">
            <div>
              <p className="kozein-eyebrow">{t('web.welcomeLabel')}</p>
              <h1>{t('web.welcome')}</h1>
              <p>{t('web.welcomeHint')}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="primary" onClick={() => navigate('video')}><Play size={15} aria-hidden="true" />{t('web.openVideo')}</Button>
                <Button variant="neutral" onClick={() => navigate('reading')}><BookOpen size={16} aria-hidden="true" />{t('reading.title')}</Button>
              </div>
            </div>
            <div className="kozein-hero-art" aria-hidden="true"><img src="./kozein.svg" alt="" /><span>{t('kozein.brand')}</span><small>{t('web.heroCaption')}</small></div>
          </section>}
          <div className="kozein-section-heading">
            <div><h2 className="text-xl font-semibold">{t(tab === 'library' ? 'web.libraryTitle' : 'web.popular')}</h2><p className="mt-1 text-sm text-text-muted">{t(tab === 'library' ? 'web.libraryHint' : 'web.catalogueHint')}</p></div>
            {tab === 'discover' && <label className="kozein-search"><Search size={17} aria-hidden="true" /><span className="sr-only">{t('common.search')}</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('web.searchPlaceholder')} maxLength={200} />
              {query && <button onClick={() => setQuery('')} aria-label={t('web.clearSearch')}><X size={16} /></button>}
            </label>}
          </div>
          {error && tab === 'discover' && <div className="kozein-notice flex flex-wrap items-center justify-between gap-3" role="alert"><span>{stale ? t('web.cached') : error}</span><Button size="sm" onClick={() => setRetry((value) => value + 1)}>{t('common.retry')}</Button></div>}
          {loading && tab === 'discover' ? <div role="status" aria-label={t('common.loading')} className="kozein-grid">{Array.from({ length: 12 }, (_, index) => <div key={index} className="kozein-skeleton motion-safe:animate-pulse" />)}</div> : cards.length ? (
            <div className="kozein-grid">{cards.map((title) => {
              const saved = list.some((item) => item.id === title.id);
              return <article className="kozein-card" key={title.id}>
                <button className="kozein-cover" onClick={() => setSelected(title)} aria-label={t('web.details', { title: title.title })}>
                  <img src={title.cover} alt="" loading="lazy" />
                  {title.score && <span className="kozein-score"><Star size={11} aria-hidden="true" />{title.score}</span>}
                </button>
                <div className="flex items-start gap-1"><button className="kozein-card-title" onClick={() => setSelected(title)}>{title.title}</button>
                  <button className="kozein-save" onClick={() => toggleList(title)} aria-pressed={saved} aria-label={t(saved ? 'web.removeTitle' : 'web.saveTitle', { title: title.title })}>{saved ? <Check size={17} /> : <Plus size={17} />}</button>
                </div>
                <p className="text-xs text-text-muted">{title.year ?? t('web.unknownYear')}{title.episodes ? ` · ${t('web.episodes', { count: title.episodes })}` : ''}</p>
              </article>;
            })}</div>
          ) : !error && <div className="kozein-empty"><Bookmark size={36} aria-hidden="true" /><h2>{t(tab === 'library' ? 'web.libraryEmpty' : 'web.noResults')}</h2><p>{t(tab === 'library' ? 'web.libraryEmptyHint' : 'web.noResultsHint')}</p>{tab === 'library' && <Button onClick={() => navigate('discover')}>{t('web.discover')}</Button>}</div>}
        </>}
        {tab === 'reading' && <Reading />}
        {tab === 'video' && <LocalVideo />}
        {tab === 'settings' && <div className="kozein-settings">
          <h1 className="text-2xl font-semibold">{t('web.settings')}</h1>
          <section><h2>{t('web.appearance')}</h2><div className="flex flex-wrap gap-2">{THEMES.map((item) => <Button key={item.id} variant={theme === item.id ? 'primary' : 'neutral'} aria-pressed={theme === item.id} onClick={() => { applyTheme(item.id); setTheme(item.id); }}>{'nameKey' in item ? t(item.nameKey) : item.name}</Button>)}</div></section>
          <section><h2>{t('web.about')}</h2><p>{t('web.aboutText')}</p><p>{t('web.nativeHint')}</p><div className="flex flex-wrap gap-4">
            <a href="https://github.com/MaidLover69/Anix" target="_blank" rel="noreferrer" className="text-accent-300">{t('web.anixCredit')} <ExternalLink className="inline" size={13} /></a>
            <a href="https://github.com/RimamashiroHina/Weebox/releases/tag/v1.1.0" target="_blank" rel="noreferrer" className="text-accent-300">{t('web.weeboxCredit')} <ExternalLink className="inline" size={13} /></a>
          </div></section>
          <section><h2>{t('web.privacyTitle')}</h2><p>{t('web.privacyText')}</p></section>
        </div>}
        <footer className="kozein-footer"><span>{t('kozein.brand')} · 1.0.0</span><span>{t('web.footer')}</span></footer>
      </main>
    </div>
    <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? ''} size="lg">
      {selected && <div className="flex flex-col gap-5">
        <div className="flex items-start gap-5"><img src={selected.cover} alt="" className="w-28 rounded-lg" /><div className="min-w-0"><p className="text-sm leading-relaxed text-text-secondary">{selected.genres.join(' · ')}</p><p className="mt-3 text-sm text-text-muted">{selected.score ? t('web.rating', { score: selected.score }) : t('web.unrated')}</p></div></div>
        <p className="max-h-60 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-text-secondary">{selected.description || t('web.noDescription')}</p>
        {(notice || storageError) && <p role={storageError ? 'alert' : 'status'} className="text-sm text-text-secondary">{storageError || notice}</p>}
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => toggleList(selected)}>{selectedSaved ? <Check size={16} /> : <Plus size={16} />}{t(selectedSaved ? 'web.inLibrary' : 'web.addLibrary')}</Button>
          {safeCatalogueLink(selected.url) && <a href={safeCatalogueLink(selected.url) ?? undefined} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-accent-300">{t('web.officialPage')}<ExternalLink size={15} /></a>}
          <Button onClick={() => {
            const link = safeCatalogueLink(selected.url);
            if (link) void navigator.clipboard.writeText(`${selected.title} — ${link}`).then(() => setNotice(t('web.copied'))).catch(() => setStorageError(t('web.copyError')));
          }}><Share2 size={15} />{t('web.share')}</Button>
        </div>
      </div>}
    </Modal>
  </div>;
};
