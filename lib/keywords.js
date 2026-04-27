// Generate plausible "Reddit keyword opportunities" from a site description.
// Heuristic-only — no LLM call. Stable + reproducible per brand.

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","of","for","to","in","on","at","by","with",
  "is","are","was","were","be","been","being","this","that","these","those","it",
  "as","from","your","you","we","our","us","they","their","i","my","me","so","do",
  "does","did","have","has","had","not","no","can","will","just","get","make","made",
  "use","using","used","like","into","more","than","then","also","all","any","every",
  "one","two","three","new","best","top","over","up","down","out","via","per","its",
  "his","her","them","what","when","why","how","where","which","who","whom","such",
  // Generic words that match too many unrelated subreddits
  "access","exclusive","tools","tool","platform","service","services","solution","solutions",
  "company","companies","business","businesses","app","apps","online","website","page",
  "free","paid","work","working","help","helping","helps","need","needs","find","finding",
  "world","worlds","global","local","easy","simple","fast","quick","powerful","modern",
  "save","saving","savings","thousands","hundreds","million","percent","plus","over",
  "exclusive","private","public","official",
]);

// Category keywords map a topical signal to a Reddit-friendly multi-word query.
// Order matters — more specific entries first.
// Match terms are tested as whole words (\b boundaries) to avoid false hits
// like "ai" matching inside "fail" or "ui" matching inside "build".
// Multilingual: many entries include French/Spanish/German equivalents so
// non-English sites still route to relevant (mostly English) subreddits.
const CATEGORIES = [
  // Tech & SaaS — developer before AI so dev-tools that mention "AI-powered" still route to dev
  { match: ["saas", "subscription software"], q: "SaaS startup" },
  { match: ["ecommerce", "shopify", "merchant", "online store", "boutique en ligne"], q: "ecommerce shopify" },
  { match: ["developer", "coding", "devops", "engineer", "programmer", "github", "git", "développeur"], q: "developer tools" },
  { match: ["productivity", "notion", "workflow", "workspace", "task manager", "productivité"], q: "productivity tools" },
  { match: ["ai", "llm", "gpt", "machine learning", "ml model", "neural", "intelligence artificielle"], q: "artificial intelligence" },
  { match: ["startup", "founder", "founders", "indie hacker", "fondateur"], q: "startup founders" },
  { match: ["marketing", "growth hacking", "seo", "campaigns", "campagne marketing"], q: "marketing growth" },
  { match: ["design", "ux", "figma", "designer", "graphisme"], q: "web design UX" },
  { match: ["hosting", "cloud", "aws", "kubernetes", "vps", "hébergement"], q: "cloud hosting" },
  { match: ["analytics", "dashboard", "metrics", "reporting", "analytique"], q: "data analytics" },
  { match: ["security", "cybersecurity", "encryption", "vulnerability", "cybersécurité"], q: "cybersecurity" },
  { match: ["crm", "sales", "leads", "pipeline", "ventes"], q: "sales CRM" },

  // Sports — moved up so "natation"/swimming gets caught
  { match: ["swimming", "natation", "swim", "swimmer", "nageur"], q: "swimming" },
  { match: ["running", "marathon", "course à pied", "jogging"], q: "running" },
  { match: ["cycling", "cyclisme", "vélo", "biking"], q: "cycling" },
  { match: ["climbing", "escalade", "bouldering"], q: "climbing" },
  { match: ["skiing", "snowboard", "ski"], q: "skiing" },
  { match: ["soccer", "football", "futbol", "fútbol", "premier league", "ligue 1"], q: "soccer" },
  { match: ["basketball", "nba", "basket"], q: "basketball" },
  { match: ["tennis", "atp", "wta"], q: "tennis" },
  { match: ["baseball", "mlb"], q: "baseball" },
  { match: ["rugby"], q: "rugby" },
  { match: ["sports", "espn", "athletics", "sport amateur"], q: "sports" },
  { match: ["fitness", "workout", "gym", "training", "musculation"], q: "fitness workout" },
  { match: ["yoga", "meditation", "mindfulness", "méditation"], q: "yoga meditation" },

  // Lifestyle
  { match: ["nutrition", "diet", "weight loss", "calorie", "régime alimentaire"], q: "nutrition diet" },
  { match: ["health", "medical", "wellness", "doctor", "santé", "médical"], q: "health wellness" },
  { match: ["beauty", "skincare", "cosmetics", "makeup", "beauté", "maquillage"], q: "skincare beauty" },
  { match: ["fashion", "clothing", "outfit", "style", "mode", "vêtements"], q: "fashion style" },
  { match: ["parenting", "baby", "kids", "toddler", "parents", "bébé", "enfants"], q: "parenting kids" },
  { match: ["pets", "dog", "cat", "puppy", "chien", "chat", "animaux"], q: "pets" },
  { match: ["dating", "relationship", "couples", "rencontres"], q: "dating relationships" },

  // Food
  { match: ["recipe", "recipes", "cooking", "chef", "cuisine", "recette", "cocina"], q: "recipes cooking" },
  { match: ["restaurant", "dining", "food delivery", "restauration"], q: "restaurants food" },
  { match: ["coffee", "espresso", "barista", "café"], q: "coffee" },
  { match: ["wine", "vin", "winery", "vignoble"], q: "wine" },

  // Money
  { match: ["finance", "invest", "trading", "stock market", "bank", "banque", "bourse"], q: "personal finance" },
  { match: ["crypto", "bitcoin", "ethereum", "blockchain", "nft", "cryptomonnaie"], q: "cryptocurrency" },
  { match: ["budget", "savings", "frugal", "épargne"], q: "budgeting savings" },
  { match: ["real estate", "rental", "mortgage", "homes", "immobilier", "location"], q: "real estate" },

  // Education & Career
  { match: ["education", "course", "learn", "tutoring", "lesson", "éducation", "cours", "apprendre"], q: "online learning" },
  { match: ["resume", "cv", "interview", "career", "hiring", "carrière", "emploi"], q: "career advice" },
  { match: ["language learning", "spanish", "french lessons", "japanese lessons", "duolingo", "apprendre langue"], q: "language learning" },
  { match: ["college", "university", "scholarship", "student", "université", "étudiant", "bourse étude"], q: "college students" },

  // Travel
  { match: ["travel", "hotel", "flight", "booking", "vacation", "trip", "voyage", "vol", "hôtel", "vacances"], q: "travel" },
  { match: ["camping", "hiking", "backpacking", "outdoors", "randonnée"], q: "camping outdoors" },

  // Entertainment
  { match: ["gaming", "video game", "esports", "twitch", "jeu vidéo"], q: "gaming" },
  { match: ["movie", "movies", "film", "cinema", "cinéma"], q: "movies" },
  { match: ["music", "song", "spotify", "playlist", "musique", "música"], q: "music" },
  { match: ["book", "books", "reading", "novel", "author", "livre", "lecture"], q: "books reading" },
  { match: ["podcast", "podcaster", "balado"], q: "podcasts" },
  { match: ["anime", "manga", "otaku"], q: "anime" },

  // Creative / Hobbies
  { match: ["photography", "camera", "lens", "photographie", "appareil photo"], q: "photography" },
  { match: ["art", "drawing", "painting", "illustration", "dessin", "peinture"], q: "art drawing" },
  { match: ["woodworking", "diy", "crafts", "handmade", "bricolage"], q: "DIY crafts" },
  { match: ["writing", "writer", "novelist", "blog", "écrire", "écrivain"], q: "writing" },

  // Auto
  { match: ["car", "cars", "auto", "vehicle", "driving", "voiture", "véhicule"], q: "cars" },
  { match: ["motorcycle", "moto"], q: "motorcycles" },

  // News / Politics
  { match: ["news", "journalism", "current events", "actualités"], q: "news" },
  { match: ["politics", "election", "government", "policy", "politique", "élection"], q: "politics" },

  // Home
  { match: ["home decor", "interior", "furniture", "décoration", "mobilier"], q: "home decor" },
  { match: ["gardening", "plants", "vegetables grow", "jardinage"], q: "gardening" },
];

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasWord(text, word) {
  if (word.includes(" ")) return text.includes(word);
  const re = new RegExp(`\\b${escapeRegex(word)}\\b`, "i");
  return re.test(text);
}

// Pick the most distinctive 2-word phrase from the description as a fallback
// query. Falls back to the brand name itself if no decent noun phrase exists.
function smartFallback(description, brand) {
  const tokens = (description || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4 && !STOP_WORDS.has(w));
  if (tokens.length === 0) return brand || "general discussion";
  // Pick the first decent noun
  const top = tokens[0];
  // If we have a 2nd word and the brand isn't redundant, combine them
  if (tokens[1]) return `${top} ${tokens[1]}`;
  return top;
}

export function pickCategoryQuery(description, brand = "") {
  const text = (description || "").toLowerCase();
  for (const c of CATEGORIES) {
    if (c.match.some((m) => hasWord(text, m))) return c.q;
  }
  return smartFallback(description, brand);
}

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));
}

function topNouns(text, n = 5) {
  const counts = new Map();
  tokenize(text).forEach((w) => counts.set(w, (counts.get(w) || 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([w]) => w);
}

// Stable pseudo-random based on string (so same brand → same chart).
function seededRandom(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return ((h >>> 0) % 10000) / 10000;
  };
}

// Heuristic keyword phrase generator — last-resort fallback when no LLM is
// configured. Produces meaningful 1-3 word phrases from the description's
// distinctive nouns. No more "{brand} free trial" nonsense suffixes.
const HEAD_MODIFIERS = [
  null, // bare noun
  "best", "top", "popular", "modern",
];

const TAIL_MODIFIERS = [
  null,
  "online", "for startups", "guide", "tips",
  "examples", "ideas", "platforms", "services",
];

export function heuristicKeywords(brand, description, n = 20) {
  const nouns = topNouns(description, 6);
  const seeds = nouns.length ? nouns : ["startup", "tools", "growth", "digital"];
  const rand = seededRandom(brand + (description || "").slice(0, 60));

  const candidates = new Set();
  // 1) bare nouns
  for (const s of seeds) candidates.add(s);
  // 2) head + noun
  for (const s of seeds) {
    for (const h of HEAD_MODIFIERS) if (h) candidates.add(`${h} ${s}`);
  }
  // 3) noun + tail
  for (const s of seeds) {
    for (const t of TAIL_MODIFIERS) if (t) candidates.add(`${s} ${t}`);
  }
  // 4) two-noun pairs
  for (let i = 0; i < seeds.length; i++) {
    for (let j = i + 1; j < seeds.length; j++) {
      candidates.add(`${seeds[i]} ${seeds[j]}`);
    }
  }

  const pool = [...candidates];
  // Deterministic shuffle, keeping length manageable
  return pool
    .map((c) => [c, rand()])
    .sort((a, b) => a[1] - b[1])
    .map(([c]) => c)
    .filter((c) => c.length <= 28)
    .slice(0, n);
}

// Take a list of keyword strings and attach plausible monthly/potential
// volumes. Numbers are deterministic per (brand, keyword) so the chart
// doesn't change between renders.
export function enrichKeywordsWithVolumes(brand, keywords) {
  const rand = seededRandom(brand + "::" + keywords.join("|"));
  return keywords.map((kw) => {
    const wordCount = kw.split(/\s+/).length;
    // Shorter (head) terms get higher volume; long-tail get lower.
    const baseMin = wordCount <= 1 ? 1200 : wordCount === 2 ? 600 : 200;
    const baseMax = wordCount <= 1 ? 8000 : wordCount === 2 ? 3500 : 1200;
    const monthly = Math.floor(baseMin + rand() * (baseMax - baseMin));
    const potential = Math.floor(monthly * (0.04 + rand() * 0.12));
    return { keyword: kw, monthly, potential };
  });
}

// Backwards-compat: full pipeline using only heuristics.
export function generateKeywords(brand, description, n = 20) {
  const kws = heuristicKeywords(brand, description, n);
  return enrichKeywordsWithVolumes(brand, kws);
}

export function totalsFromKeywords(rows) {
  const monthly = rows.reduce((s, r) => s + r.monthly, 0);
  const potential = rows.reduce((s, r) => s + r.potential, 0);
  return { count: rows.length, monthly, potential };
}
