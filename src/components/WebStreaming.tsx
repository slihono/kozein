import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Film, Link2, Play, X } from 'lucide-react';
import { Button } from './ui/Button';
import { language, t } from '../i18n';
import { officialEmbed, OFFICIAL_STREAMS, parseDirectStream, type DirectStream, type OfficialStream } from '../lib/webStreams';

function DirectPlayer({ stream }: { stream: DirectStream }) {
  const media = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const player = media.current;
    if (!player || !stream.hls) return;
    if (player.canPlayType('application/vnd.apple.mpegurl')) {
      player.src = stream.url;
      return;
    }

    let active = true;
    let destroy: (() => void) | undefined;
    void import('hls.js').then(({ default: Hls }) => {
      if (!active) return;
      if (!Hls.isSupported()) {
        setFailed(true);
        return;
      }
      const hls = new Hls({ enableWorker: true });
      destroy = () => hls.destroy();
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          hls.stopLoad();
          setFailed(true);
        }
      });
      hls.loadSource(stream.url);
      hls.attachMedia(player);
    }).catch(() => {
      if (active) setFailed(true);
    });
    return () => {
      active = false;
      destroy?.();
    };
  }, [stream]);

  return <>
    <video
      ref={media}
      src={stream.hls ? undefined : stream.url}
      controls
      playsInline
      preload="metadata"
      aria-label={t('stream.direct')}
      className="aspect-video w-full rounded-xl bg-bg-deepest"
      onError={() => setFailed(true)}
      onCanPlay={() => setFailed(false)}
    />
    {failed && <p role="alert" className="mt-3 text-sm text-state-error">{t('stream.playbackError')}</p>}
  </>;
}

type Playback = { official: OfficialStream } | { direct: DirectStream; attempt: number };

export function WebStreaming({ initial }: { initial: OfficialStream | null }) {
  const [playback, setPlayback] = useState<Playback | null>(() => initial ? { official: initial } : null);
  const [input, setInput] = useState('');
  const [invalid, setInvalid] = useState(false);
  const playerSection = useRef<HTMLElement>(null);
  const selectionHeading = useRef<HTMLHeadingElement>(null);
  const attempt = useRef(0);

  function openDirect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const stream = parseDirectStream(input);
    setInvalid(!stream);
    if (stream) setPlayback({ direct: stream, attempt: ++attempt.current });
  }

  useEffect(() => {
    if (playback) playerSection.current?.focus();
  }, [playback]);

  const official = playback && 'official' in playback ? playback.official : null;

  return <div className="flex flex-col gap-6">
    <header>
      <h1 className="text-2xl font-semibold">{t('stream.title')}</h1>
      <p className="mt-2 text-sm text-text-secondary">{t('stream.intro')}</p>
    </header>
    {playback && <section ref={playerSection} tabIndex={-1} aria-labelledby="kozein-now-playing" className="rounded-xl border border-border bg-bg-card p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="kozein-now-playing" className="text-lg font-semibold">{official?.title ?? t('stream.direct')}</h2>
        <Button variant="neutral" size="sm" onClick={() => {
          setPlayback(null);
          selectionHeading.current?.focus();
        }}><X size={14} aria-hidden="true" />{t('stream.close')}</Button>
      </div>
      {'official' in playback ? <>
        <iframe
          key={playback.official.videoId}
          src={officialEmbed(playback.official, language())}
          title={t('stream.playerLabel', { title: playback.official.title })}
          referrerPolicy="strict-origin-when-cross-origin"
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="aspect-video min-h-[200px] w-full rounded-lg border-0 bg-bg-deepest"
        />
        <p className="mt-2 text-xs text-text-secondary">{t('stream.availability')}</p>
      </> : <DirectPlayer key={playback.attempt} stream={playback.direct} />}
    </section>}
    <section aria-labelledby="kozein-official-streams">
      <h2 ref={selectionHeading} tabIndex={-1} id="kozein-official-streams" className="mb-1 text-lg font-semibold">{t('stream.selection')}</h2>
      <p className="mb-3 text-xs text-text-muted">{t('stream.provider')}</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {OFFICIAL_STREAMS.map((stream) => <li key={stream.videoId}>
          <button
            type="button"
            aria-pressed={official?.videoId === stream.videoId}
            onClick={() => setPlayback({ official: stream })}
            className="flex min-h-16 w-full items-center gap-3 rounded-lg border border-border bg-bg-card px-3 py-2 text-start hover:bg-bg-input focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-400 aria-pressed:border-accent-400"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-bg-input text-accent-300">
              {stream.format === 'film' ? <Film size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">{stream.title}</span>
              <span className="text-xs text-text-muted">{t(stream.format === 'film' ? 'stream.film' : 'stream.episode')}</span>
            </span>
          </button>
        </li>)}
      </ul>
    </section>
    <form onSubmit={openDirect} className="rounded-xl border border-border bg-bg-card p-4">
      <label htmlFor="kozein-stream-url" className="font-semibold">{t('stream.direct')}</label>
      <p id="kozein-stream-hint" className="mt-1 text-xs text-text-muted">{t('stream.directHint')}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          id="kozein-stream-url"
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          value={input}
          maxLength={4096}
          aria-invalid={invalid}
          aria-describedby="kozein-stream-hint"
          onChange={(event) => { setInput(event.target.value); setInvalid(false); }}
          className="min-w-0 flex-1 rounded-md border border-border bg-bg-input px-3 py-2 text-sm text-text-primary"
        />
        <Button type="submit" variant="primary"><Link2 size={15} aria-hidden="true" />{t('stream.play')}</Button>
      </div>
      {invalid && <p role="alert" className="mt-2 text-sm text-state-error">{t('stream.invalid')}</p>}
    </form>
  </div>;
}
