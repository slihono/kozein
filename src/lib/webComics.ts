interface Chapter {
  title?: string;
  pages: string[];
  source: string;
}

export interface WebComic {
  title: string;
  language: 'fr' | 'en' | 'ja';
  credit: string;
  creditsUrl: string;
  license: string;
  licenseUrl: string;
  nonCommercial?: boolean;
  chapters: Chapter[];
}

const PEPPER_SITE = 'https://www.peppercarrot.com';
// Published chapter slugs, titles, page counts (including cover) and optional GIF page.
// https://www.peppercarrot.com/fr/webcomics/peppercarrot.html
const PEPPER_CHAPTERS: readonly (readonly [string, string, string, number, number?])[] = [
  ["ep01_Potion-of-Flight", "Potion d'envol", "The Potion of Flight", 5],
  ["ep02_Rainbow-potions", "Les potions arc-en-ciel", "Rainbow Potions", 7],
  ["ep03_The-secret-ingredients", "L'ingrédient secret", "The Secret Ingredients", 9],
  ["ep04_Stroke-of-genius", "Éclair de génie", "Stroke of Genius", 9, 5],
  ["ep05_Special-holiday-episode", "Épisode spécial de Noël", "Special holiday episode", 6],
  ["ep06_The-Potion-Contest", "Le concours de potion", "The Potion Contest", 11],
  ["ep07_The-Wish", "Le souhait", "The Wish", 7],
  ["ep08_Pepper-s-Birthday-Party", "L'anniversaire de Pepper", "Pepper's Birthday Party", 8],
  ["ep09_The-Remedy", "Le remède", "The Remedy", 9],
  ["ep10_Summer-Special", "Spécial été", "Summer Special", 7],
  ["ep11_The-Witches-of-Chaosah", "Les sorcières de Chaosah", "The Witches of Chaosah", 8],
  ["ep12_Autumn-Clearout", "Rangement d'Automne", "Autumn Clearout", 9, 6],
  ["ep13_The-Pyjama-Party", "La Soirée Pyjama", "The Pyjama Party", 8],
  ["ep14_The-Dragon-s-Tooth", "La Dent de Dragon", "The Dragon's Tooth", 8],
  ["ep15_The-Crystal-Ball", "La Boule de Cristal", "The Crystal Ball", 10],
  ["ep16_The-Sage-of-the-Mountain", "Le Sage de la Montagne", "The Sage of the Mountain", 8],
  ["ep17_A-Fresh-Start", "Un Nouveau Départ", "A Fresh Start", 9],
  ["ep18_The-Encounter", "La Rencontre", "The Encounter", 9],
  ["ep19_Pollution", "Pollution", "Pollution", 9],
  ["ep20_The-Picnic", "Le Pique-nique", "The Picnic", 8],
  ["ep21_The-Magic-Contest", "Le Concours de Magie", "The Magic Contest", 9],
  ["ep22_The-Voting-System", "Le système de vote", "The Voting System", 12],
  ["ep23_Take-a-Chance", "Saisir la chance", "Take a Chance", 9],
  ["ep24_The-Unity-Tree", "L'Arbre de l'Unité", "The Unity Tree", 9],
  ["ep25_There-are-no-Shortcuts", "Il n'y a pas de raccourci", "There Are No Shortcuts", 11],
  ["ep26_Books-Are-Great", "Les livres, c'est génial", "Books Are Great", 8],
  ["ep27_Coriander-s-Invention", "L'Invention de Coriandre", "Coriander's Invention", 8],
  ["ep28_The-Festivities", "Les festivités", "The Festivities", 11, 2],
  ["ep29_Destroyer-of-Worlds", "Le Destructeur de Mondes", "Destroyer of Worlds", 10],
  ["ep30_Need-a-Hug", "Besoin d'un Câlin", "Need a Hug", 8],
  ["ep31_The-Fight", "Le Combat", "The Fight", 9],
  ["ep32_The-Battlefield", "Le champ de bataille", "The Battlefield", 9],
  ["ep33_Spell-of-War", "Le Sortilège de Guerre", "Spell of War", 10],
  ["ep34_The-Knighting-of-Shichimi", "L'Adoubement de Shichimi", "The Knighting of Shichimi", 12],
  ["ep35_The-Reflection", "Le Reflet", "The Reflection", 14],
  ["ep36_The-Surprise-Attack", "L'attaque Surprise", "The Surprise Attack", 17],
  ["ep37_The-Tears-of-the-Phoenix", "Les Larmes du Phénix", "The Tears of the Phoenix", 10],
  ["ep38_The-Healer", "La Guérisseuse", "The Healer", 10],
  ["ep39_The-Tavern", "La Taverne", "The Tavern", 13],
];

const UBUNCHU_SITE = 'https://seotch.wordpress.com/ubunchu/';
// Unmodified original Japanese pages from the translation team's release archive.
const UBUNCHU_ARCHIVE = 'https://gitlab.com/ubunchu-translators/ubunchu/-/raw/9f065a3fde464be893dfba9fb5fc6abc93722cf9/chapters';

function padded(number: number, digits = 2) {
  return String(number).padStart(digits, '0');
}

export function webComics(pepperLanguage: 'fr' | 'en'): WebComic[] {
  return [
    {
      title: 'Pepper&Carrot',
      language: pepperLanguage,
      credit: '© David Revoy · Pepper&Carrot',
      creditsUrl: `${PEPPER_SITE}/${pepperLanguage}/about/index.html`,
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      chapters: PEPPER_CHAPTERS.map(([slug, french, english, count, gif]) => ({
        title: pepperLanguage === 'fr' ? french : english,
        source: `${PEPPER_SITE}/${pepperLanguage}/webcomic/${slug}.html`,
        pages: Array.from({ length: count }, (_, page) =>
          `${PEPPER_SITE}/0_sources/${slug}/low-res/${pepperLanguage}_Pepper-and-Carrot_by-David-Revoy_E${slug.slice(2, 4)}P${padded(page)}.${page === gif ? 'gif' : 'jpg'}`),
      })),
    },
    {
      title: 'Ubunchu! · うぶんちゅ！',
      language: 'ja',
      credit: '© Hiroshi Seo · ASCII MEDIA WORKS Inc.',
      creditsUrl: UBUNCHU_SITE,
      license: 'CC BY-NC 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-nc/3.0/',
      nonCommercial: true,
      chapters: Array.from({ length: 8 }, (_, index) => {
        const chapter = padded(index + 1);
        const separator = index < 3 ? '_' : '-';
        const directory = `${UBUNCHU_ARCHIVE}/${chapter}/ubunchu${chapter}_ja${separator}release`;
        return {
          source: `${directory}/license_en.txt`,
          pages: Array.from({ length: 12 }, (_, page) => {
            // The chapter 2 release keeps its credits in a file named after chapter 1.
            const prefix = index === 1 && page === 0 ? '01' : chapter;
            return `${directory}/ubunchu${prefix}_${padded(page, index < 2 ? 2 : 4)}.png`;
          }),
        };
      }),
    },
  ];
}
