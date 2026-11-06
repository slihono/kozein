export type OfficialStream = {
  title: string;
  malId?: number;
} & (
  | { videoId: string; format: 'episode' | 'film' }
  | { playlistId: string; format: 'playlist' }
);

// Videos linked by the rights holder's Watch on YouTube programme:
// https://fr.gundam-official.com/feature/gwoy/
export const OFFICIAL_STREAMS: readonly OfficialStream[] = [
  { videoId: '2B_njMCRCvU', title: 'Mobile Suit Gundam: The Witch from Mercury', format: 'episode', malId: 49828 },
  { videoId: '9isbRbLD2GE', title: 'Mobile Suit Gundam Unicorn RE:0096', format: 'episode', malId: 32792 },
  { videoId: 'U10iG69axKc', title: 'Mobile Suit Gundam SEED HD Remaster', format: 'episode', malId: 93 },
  { videoId: 'paEVAzRhX2k', title: 'Mobile Suit Gundam SEED Destiny HD Remaster', format: 'episode', malId: 94 },
  { videoId: 'YYqJMKhaLhk', title: 'Mobile Suit Gundam I', format: 'film', malId: 1090 },
  { videoId: 'mAxCyrDuNiA', title: "Mobile Suit Gundam: Char's Counterattack", format: 'film', malId: 87 },

  // The official TMS Entertainment page embeds each of these playlists:
  // https://tmsanime.com/anime-on-tms-official-channel
  { playlistId: 'PLj2Ugc-vxcWEQlpeFnutiOvQ7B1KNuzLU', title: 'Sonic X (1)', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWGJbICmPjp8DADICabaURqC', title: 'Sonic X (2)', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWGeCxC1zubwBBaUMLYSUJ7j', title: 'Sonic X (3)', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWF4xi3UUb5C52EXCw31hISR', title: 'Galaxy High', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWEvomV4nRhXY9ESB3XRLFiw', title: 'Lupin the Third Part 2', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWEcTEdWmnd7PLXc2VD4eouf', title: 'Lupin the Third Part 4', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWF_In4zmEjqsGvlUreMBRfu', title: 'Cat’s Eye', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWE-tx8wM6xB1fiO3XvnJA4d', title: 'Space Adventure Cobra', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWHr0DQYzjo5BAAQ-DNVgLCx', title: 'ItaKiss', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWHe_Ltq7XbejGkX7POxG6hc', title: 'Actually, I Am…', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWHnPJDXLZMmBqVm37XnI06x', title: 'We Rent Tsukumogami', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWHy7-l49eA6oIx3kaZelE4e', title: 'Brave 10', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWH-qMU2BRfhQDjSuoSOoy46', title: 'Kenichi: The Mightiest Disciple', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWGhiXU49qGs839u1wkRUIFm', title: 'Virtua Fighter', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWGoTLSp-LU8mhqdDEovzwfc', title: 'Zinba', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWHNQZ2gcFVf7PEZnUqLNjCx', title: 'Karate Master', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWEbx1W_nCzFKF7KFAbPTxg2', title: 'Cardfight!! Vanguard', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWEEtzS-9xtgcWLIgB2ZlswK', title: 'Magic Knight Rayearth', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWGuN89n4sW2RaNSf4V1q1vL', title: 'Saint Seiya: The Lost Canvas', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWEOlcV07A3679lIYuxmQhdr', title: 'Z/X Ignition', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWFBzvU-nuA19309XyDM8GdF', title: 'Monster Rancher (1)', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWGoNKi6GSSrbcPKnQ6Ecwms', title: 'Monster Rancher (2)', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWGuUFo22NYfhSGjBB57ffzA', title: 'Monster Rancher (3)', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWG_zTnv_Bzlo_T9tG2xDmzD', title: 'The Gutsy Frog', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWGAvM7W1cmYdGgzHPJe3pOe', title: 'Tetsujin 28', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWG40YiVkqJql0vge0qy_TGF', title: 'Cybersix', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWGDWFMIlD5i-gz3u2s4tMa-', title: 'God Mars', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWEzQIsVyXKaJawcVZt9DzpJ', title: 'God Mazinger', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWG5atQ_Hp_C1JjTuihmaHnI', title: 'Knight Hunters Eternity', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWGA4L2_OOf8kbmVreOjAHph', title: 'Go Nagai’s The Devil Lady', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWHUl4CJyaUBA6z3hqcCd9kv', title: 'Requiem from the Darkness', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWHS09WPvSgcqZGSZ5-9z1Qy', title: 'Sherlock Hound', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWGbdBT4aNwgLUS2fNKgM-vZ', title: 'Yowamushi Pedal', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWHjtkWS4y08HQF2BU2GJqCB', title: 'Yowamushi Pedal Grande Road', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWHGl_b6OTb3jlgGgreyf7O5', title: 'The Journey Home', format: 'playlist' },
  { playlistId: 'PLj2Ugc-vxcWFgnCkKXT1Dv4I7tsAN1asK', title: 'Anisava', format: 'playlist' },
];

export function officialStreamFor(id: number): OfficialStream | undefined {
  return OFFICIAL_STREAMS.find((stream) => stream.malId === id);
}

export function officialEmbed(stream: OfficialStream, locale: string): string {
  const url = new URL('https://www.youtube-nocookie.com');
  if (stream.format === 'playlist') {
    url.pathname = '/embed/videoseries';
    url.searchParams.set('list', stream.playlistId);
  } else {
    url.pathname = `/embed/${encodeURIComponent(stream.videoId)}`;
  }
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
