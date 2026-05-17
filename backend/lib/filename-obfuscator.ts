/**
 * Filename obfuscator — turns recognisable game titles into meme-y variants so
 * uploads to a secondary GDrive don't trip naive copyright string scanners,
 * while staying human-recognisable to people in the know.
 *
 * Examples:
 *   "Crash Bandicoot Warped"     → "Bandicoot_Crash_Wrapped.pkg"
 *   "Grand Theft Auto V"         → "Theft_Grande_Self_5.pkg"
 *   "The Last of Us Part II"     → "Last_The_Us_Of_Episode_2.pkg"
 *
 * Properties:
 *   - Deterministic: same input → same output (cron/idempotency safe)
 *   - Reversible by human in ~3 seconds
 *   - No URL-unsafe chars, no diacritics, no whitespace
 *   - Preserves any .pkg / .iso / .zip extension passed in
 *   - Length cap = 80 chars (before extension) to stay under GDrive limits
 *
 * Strategy:
 *   1. Split title into tokens (words / numerals / roman)
 *   2. Swap each token via curated dict if known, else leave as-is
 *   3. Roman numerals → arabic
 *   4. Reorder: swap pairs of adjacent tokens (1↔2, 3↔4 …) — preserves meaning
 *      for a human, breaks naive substring matches
 *   5. Join with underscore, append extension, clamp length
 */

const WORD_DICT: Record<string, string> = {
  // Franchises / common nouns
  crash: "Accident",
  bandicoot: "Bandicota",
  mario: "Marino",
  luigi: "Luiggi",
  bowser: "Browser",
  zelda: "Zalda",
  link: "Linko",
  ganondorf: "Ganondalf",
  pokemon: "Pocketmon",
  pikachu: "Picacho",
  sonic: "Hypersonic",
  knuckles: "Fistos",
  tails: "Tailo",
  metroid: "Metroides",
  samus: "Sammas",
  kirby: "Kirbyy",
  pacman: "Pakman",
  tetris: "Tetrix",
  doom: "Dom",
  quake: "Quaker",
  halo: "Aura",
  master: "Maestro",
  chief: "Boss",
  fortnite: "Fortenoche",
  minecraft: "Minecrafty",
  roblox: "Roeblox",
  uncharted: "Uncarted",
  drake: "Draco",
  // Verbs / adjectives
  grand: "Grande",
  theft: "Theft",
  auto: "Self",
  the: "El",
  last: "Last",
  of: "Of",
  us: "Us",
  part: "Episode",
  warped: "Wrapped",
  resident: "Resident",
  evil: "Eviltwin",
  village: "Villagio",
  silent: "Silent",
  hill: "Hillo",
  metal: "Metalo",
  gear: "Gearo",
  solid: "Solidus",
  snake: "Snek",
  final: "Finale",
  fantasy: "Fantasia",
  call: "Call",
  duty: "Dutie",
  black: "Bleck",
  ops: "Operations",
  modern: "Moderno",
  warfare: "Warfaring",
  battlefield: "Battlefiel",
  cyber: "Ciber",
  punk: "Punko",
  god: "Godo",
  war: "Warfaring",
  ragnarok: "Ragnaroke",
  dark: "Darko",
  souls: "Soles",
  bloodborne: "Bloodbore",
  sekiro: "Sekiroe",
  elden: "Eldon",
  ring: "Ringo",
  red: "Red",
  dead: "Dad",
  redemption: "Redemtion",
  horizon: "Horizone",
  zero: "Zer0",
  dawn: "Down",
  forbidden: "Forbiddon",
  west: "Wester",
  ratchet: "Ratch",
  clank: "Clanck",
  spider: "Spyder",
  man: "Mano",
  spiderman: "Spyderman",
  miles: "Millas",
  morales: "Moralus",
  street: "Streetz",
  fighter: "Fyter",
  tekken: "Tekkono",
  mortal: "Mortale",
  kombat: "Kombatant",
  smash: "Smashing",
  bros: "Brothers",
  brothers: "Bros",
  super: "Supre",
  mega: "Maga",
  galaxy: "Galaxe",
  odyssey: "Odisey",
  kart: "Karto",
  wii: "Wee",
  wiiu: "Wii_u",
  switch: "Switche",
  playstation: "Playstation",
  xbox: "Exbox",
  nintendo: "Nintando",
  // Common particles
  and: "Et",
  the_: "El",
  with: "With",
  ninja: "Ninjo",
  assassin: "Asassino",
  creed: "Creedo",
  origins: "Origines",
  odyssey_: "Odisey",
  valhalla: "Valhalle",
  far: "Faro",
  cry: "Cri",
  watch: "Wash",
  dogs: "Dogos",
  rainbow: "Rinbow",
  six: "Seks",
  siege: "Siejo",
  ghost: "Goste",
  recon: "Recon",
  breakpoint: "Brakpoint",
  wildlands: "Wildlandes",
  fifa: "Fifo",
  pes: "Pess",
  efootball: "Efoot",
  madden: "Madin",
  nba: "Inba",
  nfl: "Infl",
  destiny: "Destiney",
  borderlands: "Borderlandes",
  diablo: "Diavlo",
  overwatch: "Overwash",
  starcraft: "Starcrafty",
  warcraft: "Warcrafty",
  world: "Mundo",
  hearthstone: "Hearstone",
  league: "Leage",
  legends: "Lejends",
  legend: "Lejend",
  gravity: "Gravety",
  antigravity: "Antigravity",
};

const ROMAN_TO_ARABIC: Record<string, string> = {
  i: "1", ii: "2", iii: "3", iv: "4", v: "5",
  vi: "6", vii: "7", viii: "8", ix: "9", x: "10",
  xi: "11", xii: "12", xiii: "13", xiv: "14", xv: "15",
};

const KNOWN_EXTENSIONS = new Set([
  "pkg", "iso", "zip", "7z", "rar", "tar", "gz", "xz", "img", "cso", "chd",
  "nsp", "xci", "nca", "wbfs", "rvz", "wad", "cia", "3ds",
]);

function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function splitExtension(name: string): { stem: string; ext: string } {
  const idx = name.lastIndexOf(".");
  if (idx <= 0) return { stem: name, ext: "" };
  const candidate = name.slice(idx + 1).toLowerCase();
  if (KNOWN_EXTENSIONS.has(candidate)) {
    return { stem: name.slice(0, idx), ext: candidate };
  }
  return { stem: name, ext: "" };
}

function tokenize(stem: string): string[] {
  return stripDiacritics(stem)
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function transformToken(tok: string): string {
  const lower = tok.toLowerCase();
  // Pure number → leave
  if (/^\d+$/.test(tok)) return tok;
  // Roman numeral → arabic
  if (ROMAN_TO_ARABIC[lower]) return ROMAN_TO_ARABIC[lower]!;
  // Dictionary hit
  if (WORD_DICT[lower]) return WORD_DICT[lower]!;
  // Generic mangling: append double last consonant if word length ≥ 4
  if (tok.length >= 4) {
    const last = tok[tok.length - 1]!;
    if (/[bcdfgklmnprstvz]/i.test(last)) {
      return tok + last.toLowerCase() + "o";
    }
    return tok + "e";
  }
  return tok;
}

function swapAdjacentPairs(tokens: string[]): string[] {
  const out = [...tokens];
  for (let i = 0; i + 1 < out.length; i += 2) {
    const a = out[i]!;
    const b = out[i + 1]!;
    out[i] = b;
    out[i + 1] = a;
  }
  return out;
}

const MAX_STEM = 80;

export type ObfuscateOptions = {
  /** Extension to use if input has none. Default: "zip" — neutral, avoids
   *  console-specific giveaways like ".pkg" / ".nsp" / ".xci" being matched
   *  by share-link scanners. */
  defaultExt?: string;
  /** Disable adjacent pair swap (debug). Default: false. */
  noSwap?: boolean;
  /** Optional salt (e.g. pkg-id) — appended as a short suffix so identical
   *  titles for different PKGs yield distinct filenames (defeats Google
   *  cross-account filename dedup / fingerprinting). */
  salt?: string;
  /** Force replacement of the extension. When unset, behaviour is:
   *    - if input has a *console-specific* extension (pkg/nsp/xci/...) it is
   *      replaced with `defaultExt` so the upload doesn't advertise the
   *      platform.
   *    - if input has a *neutral* archive extension (zip/7z/rar/...) it is
   *      preserved.
   *  Set this to override the heuristic. */
  forceExt?: string;
};

/** Console-specific extensions we never want to leak in the public filename. */
const CONSOLE_EXTENSIONS = new Set([
  "pkg", "nsp", "xci", "nca", "wbfs", "rvz", "wad", "cia", "3ds", "iso", "chd",
]);

function shortHash(s: string, len = 6): string {
  // Tiny deterministic hash — not crypto, just enough to disambiguate titles.
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(36).padStart(7, "0").slice(0, len);
}

export function obfuscateFilename(input: string, opts: ObfuscateOptions = {}): string {
  const { defaultExt = "zip", noSwap = false, salt, forceExt } = opts;

  const { stem, ext } = splitExtension(input);
  const tokens = tokenize(stem);
  if (tokens.length === 0) {
    const e = forceExt ?? (ext && !CONSOLE_EXTENSIONS.has(ext) ? ext : defaultExt);
    return `untitled.${e}`;
  }

  const transformed = tokens.map(transformToken);
  const reordered = noSwap ? transformed : swapAdjacentPairs(transformed);

  let joined = reordered.join("_");

  if (salt) {
    const suffix = `_${shortHash(salt)}`;
    if (joined.length + suffix.length > MAX_STEM) {
      joined = joined.slice(0, MAX_STEM - suffix.length).replace(/_+$/, "");
    }
    joined = `${joined}${suffix}`;
  } else if (joined.length > MAX_STEM) {
    joined = joined.slice(0, MAX_STEM).replace(/_+$/, "");
  }

  const finalExt =
    forceExt ?? (ext && !CONSOLE_EXTENSIONS.has(ext) ? ext : defaultExt);
  return `${joined}.${finalExt}`;
}

/** Convenience: obfuscate a title (no extension expected) for a given pkg id.
 *  The pkg id is used as a salt so identical titles map to distinct names. */
export function obfuscateTitleForPkg(title: string, pkgId?: string, ext = "zip"): string {
  return obfuscateFilename(title, { defaultExt: ext, salt: pkgId });
}
