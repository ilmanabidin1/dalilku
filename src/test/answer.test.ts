import { describe, expect, it } from "vitest";
import { SEED_CARDS } from "@/data/seed-cards";
import { cardsForPrompt, guardAnswer } from "@/lib/answer";
import type { PublicCard } from "@/lib/types";

const offered: PublicCard[] = SEED_CARDS.slice(4, 6).map((content, i) => ({
  id: `k${i + 5}`,
  content,
  version: 1,
  validated: true,
  updatedAt: "2026-01-01T00:00:00Z",
}));

describe("guardAnswer", () => {
  it("menerima jawaban yang hanya memakai kartu yang diberikan", () => {
    const r = guardAnswer(
      { relevant_card_ids: ["k5"], answer: "Paylater berbunga tidak sesuai syariah.", out_of_scope: false },
      offered,
    );
    expect(r).toEqual({ ok: true, cardIds: ["k5"], answer: "Paylater berbunga tidak sesuai syariah." });
  });

  it("membuang id kartu karangan dan menolak bila tidak tersisa", () => {
    expect(guardAnswer({ relevant_card_ids: ["k99"], answer: "x", out_of_scope: false }, offered)).toEqual({
      ok: false,
      reason: "tanpa-kartu",
    });
    const r = guardAnswer({ relevant_card_ids: ["k99", "k6"], answer: "Pinjol haram.", out_of_scope: false }, offered);
    expect(r.ok && r.cardIds).toEqual(["k6"]);
  });

  it("menolak jawaban yang menulis nomor fatwa sendiri", () => {
    for (const answer of [
      "Menurut Fatwa No. 1 Tahun 2004, paylater riba.",
      "Lihat fatwa 117/DSN-MUI/II/2018.",
      "Berdasarkan nomor 77 fatwa DSN.",
    ]) {
      expect(guardAnswer({ relevant_card_ids: ["k5"], answer, out_of_scope: false }, offered).ok).toBe(false);
    }
  });

  it("menolak angka yang tidak ada di kartu", () => {
    const r = guardAnswer(
      { relevant_card_ids: ["k5"], answer: "Bunganya biasanya 37 persen per tahun.", out_of_scope: false },
      offered,
    );
    expect(r).toEqual({ ok: false, reason: "angka-tidak-dikenal:37" });
  });

  it("meneruskan penanda di luar cakupan", () => {
    expect(guardAnswer({ relevant_card_ids: [], answer: "", out_of_scope: true }, offered)).toEqual({
      ok: false,
      reason: "di-luar-cakupan",
    });
  });
});

describe("cardsForPrompt", () => {
  it("tidak mengirim nomor rujukan ke model", () => {
    const text = JSON.stringify(cardsForPrompt(offered));
    expect(text).not.toMatch(/DSN-MUI\/|POJK|No\. ?\d/);
  });
});
