export interface OfficialStream {
  videoId: string;
  title: string;
  format: 'episode' | 'film';
  malId: number;
}

// Videos linked by the rights holder's Watch on YouTube programme:
// https://fr.gundam-official.com/feature/gwoy/
export const OFFICIAL_STREAMS: readonly OfficialStream[] = [
  { videoId: '2B_njMCRCvU', title: 'Mobile Suit Gundam: The Witch from Mercury', format: 'episode', malId: 49828 },
  { videoId: '9isbRbLD2GE', title: 'Mobile Suit Gundam Unicorn RE:0096', format: 'episode', malId: 32792 },
  { videoId: 'U10iG69axKc', title: 'Mobile Suit Gundam SEED HD Remaster', format: 'episode', malId: 93 },
  { videoId: 'paEVAzRhX2k', title: 'Mobile Suit Gundam SEED Destiny HD Remaster', format: 'episode', malId: 94 },
  { videoId: 'YYqJMKhaLhk', title: 'Mobile Suit Gundam I', format: 'film', malId: 1090 },
  { videoId: 'mAxCyrDuNiA', title: "Mobile Suit Gundam: Char's Counterattack", format: 'film', malId: 87 },
];

export function officialStreamFor(id: number): OfficialStream | undefined {
  return OFFICIAL_STREAMS.find((stream) => stream.malId === id);
}

export function officialEmbed(stream: OfficialStream, locale: string): string {
  const url = new URL(`https://www.youtube-nocookie.com/embed/${encodeURIComponent(stream.videoId)}`);
  url.searchParams.set('playsinline', '1');
  url.searchParams.set('cc_lang_pref', locale);
  return url.href;
}

export interface DirectStream {
  url: string;
  hls: boolean;
}

/** Accept a media URL, not an HTML page. Keep temporary query parameters out of storage and logs. */
export function parseDirectStream(value: string): DirectStream | null {
  const input = value.trim();
  if (input.length > 4096 || !/^https:\/\//i.test(input) || /[\u0000-\u001f\u007f\\]/.test(input)) return null;
  try {
    const url = new URL(input);
    if (url.username || url.password || !/\.(mp4|m4v|webm|m3u8)$/i.test(url.pathname)) return null;
    return { url: url.href, hls: /\.m3u8$/i.test(url.pathname) };
  } catch {
    return null;
  }
}
