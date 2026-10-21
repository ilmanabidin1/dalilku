import { describe, expect, it } from "vitest";
import { SEED_CARDS } from "@/data/seed-cards";
import { filterCards, searchCards } from "@/lib/search";
import type { PublicCard } from "@/lib/types";

const cards: PublicCard[] = SEED_CARDS.map((content, i) => ({
  id: `k${i + 1}`,
  content,
  version: 1,
  validated: false,
  updatedAt: "2026-01-01T00:00:00Z",
}));

function top(q: string) {
  return searchCards(q, cards)[0]?.card.content.slug;
}

describe("data kartu", () => {
  it("berisi 25 kartu dengan slug unik", () => {
    expect(SEED_CARDS).toHaveLength(25);
    expect(new Set(SEED_CARDS.map((c) => c.slug)).size).toBe(25);
  });

  it("setiap kartu punya rujukan utama, alasan, dan kata kunci", () => {
    for (const c of SEED_CARDS) {
      expect(c.references.length, c.slug).toBeGreaterThan(0);
      expect(c.reasons.length, c.slug).toBeGreaterThan(0);
      expect(c.keywords.length, c.slug).toBeGreaterThan(0);
      if (c.status === "bersyarat") expect(c.conditions.length, c.slug).toBeGreaterThan(0);
    }
  });

  it("tidak memakai tanda pisah panjang", () => {
    expect(JSON.stringify(SEED_CARDS)).not.toMatch(/[—–]/);
  });
});

describe("searchCards", () => {
  it.each([
    ["paylater halal nggak?", "paylater-berbunga"],
    ["Apakah pinjol itu riba", "pinjaman-online-pinjol"],
    ["hukum bitcoin", "jual-beli-aset-kripto"],
    ["kredit motor di leasing", "kredit-kendaraan-leasing-konvensional"],
    ["boleh beli saham syariah?", "saham-daftar-efek-syariah"],
    ["ikut MLM boleh?", "mlm-berbasis-rekrutmen"],
    ["tabungan emas digital", "tabungan-emas-digital"],
    ["reksadana syariah aman?", "reksadana-syariah"],
    ["main slot online", "undian-berbayar-judi-online"],
    ["iuran BPJS", "bpjs-kesehatan"],
    ["cicilan 0% di marketplace", "paylater-berbunga"],
  ])("%s -> %s", (q, slug) => {
    expect(top(q)).toBe(slug);
  });

  it("tidak mencocokkan pertanyaan di luar cakupan", () => {
    expect(searchCards("hukum makan kepiting", cards)).toEqual([]);
    expect(searchCards("bagaimana cara sholat jamak", cards)).toEqual([]);
    expect(searchCards("apa", cards)).toEqual([]);
  });
});

describe("filterCards", () => {
  it("menyaring berdasarkan kata", () => {
    const slugs = filterCards("emas", cards).map((c) => c.content.slug);
    expect(slugs).toContain("gadai-emas-syariah");
    expect(slugs).toContain("tabungan-emas-digital");
    expect(slugs).not.toContain("pinjaman-online-pinjol");
  });

  it("mengembalikan semua bila kosong", () => {
    expect(filterCards("", cards)).toHaveLength(25);
  });
});
