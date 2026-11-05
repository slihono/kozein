import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { orderedImages, readingPage, bookTitle, READING_LIMITS } from '../src/lib/reading.ts';
import { safeCatalogueLink, storedWatchlist, webCatalogue, fetchCatalogue, catalogueDescription } from '../src/lib/webCatalogue.ts';
import { parseDeepLink } from '../src/lib/routes.ts';

test('reading sorts page numbers naturally without mutating the selection', () => {
  const files = [10, 2, 1].map((n) => ({ name: `volume-${n}.png`, type: 'image/png', size: 20 }));
  assert.deepEqual(orderedImages(files).map((file) => file.name), ['volume-1.png', 'volume-2.png', 'volume-10.png']);
  assert.equal(files[0].name, 'volume-10.png');
});

test('reading refuses unsupported, empty, oversized and excessive page selections', () => {
  const image = { name: '1.jpg', type: 'image/jpeg', size: 1 };
  assert.throws(() => orderedImages([]), /reading.invalidPages/);
  assert.throws(() => orderedImages(Array(601).fill(image)), /reading.invalidPages/);
  for (const size of [0, -1, NaN, Infinity, 1.5, READING_LIMITS.pageBytes + 1]) {
    assert.throws(() => orderedImages([{ ...image, size }]), /reading.invalidImage/);
  }
  assert.throws(() => orderedImages([{ ...image, type: 'image/svg+xml' }]), /reading.invalidImage/);
  assert.throws(() => orderedImages([{ ...image, type: 'text/html' }]), /reading.invalidImage/);
  assert.throws(() => orderedImages(Array(12).fill({ ...image, size: READING_LIMITS.pageBytes })), /reading.tooLarge/);
  assert.equal(orderedImages([image]).length, 1);
});

test('a reading position always stays within the volume', () => {
  assert.equal(readingPage(-9, 10), 0);
  assert.equal(readingPage(99, 10), 9);
  assert.equal(readingPage(3.8, 10), 3);
  assert.equal(readingPage(NaN, 10), 0);
  assert.equal(readingPage(Infinity, 10), 0);
  assert.equal(readingPage(8, 0), 0);
  assert.equal(bookTitle('A_story-01.png'), 'A story 01');
});

test('catalogue descriptions display line breaks and text without HTML markup', () => {
  assert.equal(catalogueDescription('First<br><br><b>Second</b> &amp; &quot;last&quot;'), 'First\n\nSecond & "last"');
  assert.equal(catalogueDescription(null), '');
  assert.equal(catalogueDescription('<p>hello</p>'), 'hello');
});

test('shared catalogue links accept only HTTPS MyAnimeList anime pages', () => {
  assert.equal(safeCatalogueLink('https://myanimelist.net/anime/1/Cowboy_Bebop'), 'https://myanimelist.net/anime/1/Cowboy_Bebop');
  assert.equal(safeCatalogueLink('https://anilist.co/anime/1'), 'https://anilist.co/anime/1');
  for (const value of ['javascript:alert(1)', 'file:///etc/passwd', 'http://myanimelist.net/anime/1', 'https://myanimelist.net.attacker.test/anime/1', 'https://attacker.test/anime/1', 'https://myanimelist.net/profile/1']) {
    assert.equal(safeCatalogueLink(value), null);
  }
});

test('corrupt browser storage never destroys valid watchlist entries', () => {
  const title = { id: 1, title: 'Cowboy Bebop', cover: 'https://cdn.myanimelist.net/1.jpg', description: '', genres: ['Sci-Fi'], url: 'https://myanimelist.net/anime/1', score: 8.7, year: 1998, episodes: 26 };
  assert.deepEqual(storedWatchlist('{broken'), []);
  assert.deepEqual(storedWatchlist('{}'), []);
  assert.deepEqual(storedWatchlist(null), []);
  assert.deepEqual(storedWatchlist(JSON.stringify([title, null, {}, { ...title, id: -5 }, { ...title, url: 'javascript:alert(1)' }, { ...title, genres: [12] } ])), [title]);
});

test('catalogue requests filter adult content and normalize real API results', async (context) => {
  let requested;
  context.mock.method(globalThis, 'fetch', async (url) => {
    requested = url;
    return new Response(JSON.stringify({ data: [{ mal_id: 1, title: 'Original', title_english: 'Title', images: { jpg: { large_image_url: 'https://cdn.myanimelist.net/test.jpg' } }, score: 8, episodes: 12, year: 2020, genres: [{ name: 'Action' }], url: 'https://myanimelist.net/anime/1' }] }), { status: 200 });
  });
  const result = await webCatalogue('hello world', new AbortController().signal);
  assert.equal(requested.searchParams.get('sfw'), 'true');
  assert.equal(requested.searchParams.get('q'), 'hello world');
  assert.equal(result[0].title, 'Title');
  assert.deepEqual(result[0].genres, ['Action']);
});

test('catalogue outages produce an actionable error instead of an empty success', async (context) => {
  context.mock.method(globalThis, 'fetch', async () => new Response('', { status: 429 }));
  await assert.rejects(webCatalogue('', new AbortController().signal), /web.catalogueError/);
});

test('AniList serves the catalogue when Jikan fails, keeping shared MAL identities', async (context) => {
  const requested = [];
  context.mock.method(globalThis, 'fetch', async (url, options) => {
    requested.push(String(url));
    if (String(url).includes('jikan')) return new Response('', { status: 503 });
    const body = JSON.parse(options.body);
    assert.equal(body.variables.search, 'Bebop');
    assert.match(body.query, /isAdult: false/);
    return new Response(JSON.stringify({ data: { Page: { media: [{ id: 1, idMal: 1, title: { english: 'Cowboy Bebop', romaji: 'Cowboy Bebop' }, coverImage: { large: 'https://s4.anilist.co/1.jpg' }, averageScore: 87, episodes: 26, seasonYear: 1998, genres: ['Sci-Fi'], description: null, siteUrl: 'https://anilist.co/anime/1' }] } } }));
  });
  const result = await fetchCatalogue('Bebop', new AbortController().signal);
  assert.equal(requested.length, 2);
  assert.equal(result[0].id, 1);
  assert.equal(result[0].score, 8.7);
  assert.equal(result[0].url, 'https://myanimelist.net/anime/1');
});

test('Kozein links preserve compatibility with existing Anix and Anilili links', () => {
  assert.equal(parseDeepLink('kozein://anime/154587'), 154587);
  assert.equal(parseDeepLink('anix://anime/154587'), 154587);
  assert.equal(parseDeepLink('anilili://anime/-300000099'), -300000099);
  assert.equal(parseDeepLink('kozein://anime/0'), null);
  assert.equal(parseDeepLink('kozein://anime/../../settings'), null);
});

test('the fork keeps upstream credits and separates its native data and updates', () => {
  const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const config = JSON.parse(read('src-tauri/tauri.conf.json'));
  assert.equal(config.productName, 'Kozein');
  assert.equal(config.identifier, 'io.kozein.app');
  assert.match(read('LICENSE'), /Copyright \(c\) 2026 MaidLover69/);
  assert.match(read('LICENSE'), /Copyright \(c\) 2026 Kozein/);
  assert.match(read('src-tauri/src/db.rs'), /APP_DIR_NAME: &str = "kozein"/);
  assert.match(read('src-tauri/src/db.rs'), /LEGACY_APP_DIR_NAME: &str = "kozein-legacy"/);
  assert.match(read('src-tauri/src/clients/update.rs'), /option_env!\("KOZEIN_SITE_URL"\)/);
});
