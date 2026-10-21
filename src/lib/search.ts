import type { PublicCard } from "./types";

const STOPWORDS = new Set(
  (
    "apa apakah yang dan atau di ke dari itu ini boleh halal haram gak ga nggak tidak enggak " +
    "hukum hukumnya bagaimana gimana kalau kalo jika saya aku kita kami untuk dengan dalam pakai " +
    "memakai pake menurut islam syariah syar'i adalah ada sih dong ya kah pun juga bisa " +
    "mau ingin sudah udah lagi seperti buat tentang soal status sesuai"
  ).split(/\s+/),
);

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/%/g, " persen ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokens(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function tokenMatch(a: string, b: string): boolean {
  if (a === b) return true;
  // Toleransi imbuhan sederhana: "cicilannya" ~ "cicilan", "pinjolnya" ~ "pinjol".
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  return short.length >= 4 && long.startsWith(short);
}

export interface SearchHit {
  card: PublicCard;
  score: number;
}

/**
 * Pencarian leksikal atas kartu. Bobot terbesar untuk frasa kata kunci yang
 * muncul utuh di pertanyaan, lalu kecocokan token pada judul dan kata kunci.
 */
export function searchCards(query: string, cards: PublicCard[], limit = 5): SearchHit[] {
  const qNorm = ` ${normalize(query)} `;
  const qTokens = tokens(query);
  if (qTokens.length === 0) return [];

  const hits: SearchHit[] = [];
  for (const card of cards) {
    const { title, keywords, category } = card.content;
    let score = 0;

    for (const kw of keywords) {
      const kwNorm = normalize(kw);
      if (kwNorm && qNorm.includes(` ${kwNorm} `)) score += 3 + kwNorm.split(" ").length * 2;
    }

    const fieldTokens = new Set([...tokens(title), ...keywords.flatMap(tokens), ...tokens(category)]);
    let matched = 0;
    for (const qt of qTokens) {
      for (const ft of fieldTokens) {
        if (tokenMatch(qt, ft)) {
          matched += 1;
          break;
        }
      }
    }
    score += matched * 1.5;
    if (matched === qTokens.length) score += 1;

    if (score >= 3) hits.push({ card, score });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Pencarian untuk kotak filter beranda: semua token harus muncul di suatu field. */
export function filterCards(query: string, cards: PublicCard[]): PublicCard[] {
  const qTokens = tokens(query);
  if (qTokens.length === 0) return cards;
  return cards.filter((card) => {
    const { title, keywords, category, summary } = card.content;
    const fieldTokens = [title, category, summary, ...keywords].flatMap(tokens);
    return qTokens.every((qt) => fieldTokens.some((ft) => tokenMatch(qt, ft)));
  });
}
