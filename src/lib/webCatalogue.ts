export interface CatalogueTitle {
  id: number;
  title: string;
  cover: string;
  score: number | null;
  episodes: number | null;
  year: number | null;
  genres: string[];
  description: string;
  url: string;
}

/** Metadata is rendered as plain text; AniList sometimes returns line-break markup even with asHtml=false. */
export function catalogueDescription(value: string | null | undefined): string {
  return (value ?? '').replace(/<br\s*\/?\s*>/gi, '\n').replace(/<\/p\s*>/gi, '\n\n')
    .replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#(?:0?39|x27);/gi, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}

interface JikanTitle {
  mal_id: number;
  title: string;
  title_english?: string;
  images: { webp?: { large_image_url: string }; jpg: { large_image_url: string } };
  score: number | null;
  episodes: number | null;
  year: number | null;
  synopsis?: string;
  genres: { name: string }[];
  url: string;
}

/** Public metadata only. Browser mode never executes extensions or sends account tokens. */
export async function webCatalogue(query: string, signal: AbortSignal): Promise<CatalogueTitle[]> {
  const url = new URL(query.trim() ? 'https://api.jikan.moe/v4/anime' : 'https://api.jikan.moe/v4/top/anime');
  url.searchParams.set('limit', '24');
  url.searchParams.set('sfw', 'true');
  if (query.trim()) url.searchParams.set('q', query.trim().slice(0, 200));
  else url.searchParams.set('filter', 'bypopularity');
  const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(4_000)]) });
  if (!response.ok) throw new Error('web.catalogueError');
  const json = await response.json() as { data?: JikanTitle[] };
  if (!Array.isArray(json.data)) throw new Error('web.catalogueError');
  return json.data.map((item) => ({
    id: item.mal_id, title: item.title_english || item.title,
    cover: item.images.webp?.large_image_url ?? item.images.jpg.large_image_url,
    score: item.score, episodes: item.episodes, year: item.year,
    description: catalogueDescription(item.synopsis), genres: item.genres.map((genre) => genre.name), url: item.url,
  })).filter((item, index, all) => all.findIndex((other) => other.id === item.id) === index);
}

export function safeCatalogueLink(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['myanimelist.net', 'anilist.co'].includes(url.hostname) && /^\/anime\/\d+(?:\/|$)/.test(url.pathname) ? url.href : null;
  } catch { return null; }
}

interface AniListTitle {
  id: number;
  idMal: number | null;
  title: { english: string | null; romaji: string };
  coverImage: { large: string };
  averageScore: number | null;
  episodes: number | null;
  seasonYear: number | null;
  genres: string[];
  description: string | null;
  siteUrl: string;
}

/** Independent public catalogue fallback. MAL ids keep watchlist entries stable between sources. */
export async function fetchCatalogue(query: string, signal: AbortSignal): Promise<CatalogueTitle[]> {
  try { return await webCatalogue(query, signal); }
  catch (error) { if (signal.aborted) throw error; }
  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    signal: AbortSignal.any([signal, AbortSignal.timeout(12_000)]),
    body: JSON.stringify({
      query: 'query ($search: String) { Page(perPage: 24) { media(type: ANIME, isAdult: false, search: $search, sort: POPULARITY_DESC) { id idMal title { english romaji } coverImage { large } averageScore episodes seasonYear genres description(asHtml: false) siteUrl } } }',
      variables: { search: query.trim().slice(0, 200) || null },
    }),
  });
  if (!response.ok) throw new Error('web.catalogueError');
  const json = await response.json() as { data?: { Page?: { media?: AniListTitle[] } } };
  if (!Array.isArray(json.data?.Page?.media)) throw new Error('web.catalogueError');
  return json.data.Page.media.map((item) => ({
    id: item.idMal ?? 1_000_000_000 + item.id, title: item.title.english || item.title.romaji,
    cover: item.coverImage.large, score: item.averageScore === null ? null : item.averageScore / 10,
    episodes: item.episodes, year: item.seasonYear, genres: item.genres,
    description: catalogueDescription(item.description), url: item.idMal ? `https://myanimelist.net/anime/${item.idMal}` : item.siteUrl,
  }));
}

export function storedWatchlist(value: string | null): CatalogueTitle[] {
  try {
    const items: unknown = JSON.parse(value ?? '[]');
    if (!Array.isArray(items)) return [];
    return items.filter((item): item is CatalogueTitle => !!item && typeof item === 'object'
      && Number.isSafeInteger(item.id) && item.id > 0 && typeof item.title === 'string'
      && typeof item.cover === 'string' && typeof item.description === 'string'
      && Array.isArray(item.genres) && item.genres.every((genre: unknown) => typeof genre === 'string')
      && typeof item.url === 'string' && !!safeCatalogueLink(item.url)).slice(0, 2000);
  } catch { return []; }
}
