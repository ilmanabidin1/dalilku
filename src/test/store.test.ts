import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

async function freshStore(showDrafts: "true" | "false") {
  vi.resetModules();
  process.env.STORE_PATH = path.join(mkdtempSync(path.join(tmpdir(), "dalilku-")), "store.json");
  process.env.SHOW_DRAFT_CARDS = showDrafts;
  const store = await import("@/lib/store");
  store.__resetCache();
  return store;
}

describe("store dan alur kerja", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("menyembunyikan draf bila mode pratinjau draf mati", async () => {
    const store = await freshStore("false");
    expect(await store.listPublicCards()).toHaveLength(0);
  });

  it("menampilkan draf bertanda belum divalidasi saat mode pratinjau", async () => {
    const store = await freshStore("true");
    const cards = await store.listPublicCards();
    expect(cards).toHaveLength(25);
    expect(cards.every((c) => !c.validated)).toBe(true);
  });

  it("hanya dewan pengawas yang bisa menyetujui, lalu kartu tayang", async () => {
    const store = await freshStore("false");
    await expect(store.transitionCard("k001", "setujui", "Kurator A", "kurator")).rejects.toThrow(/tidak berwenang/);
    await store.transitionCard("k001", "setujui", "Dr. Pengawas", "pengawas", "Sudah dicocokkan");
    const pub = await store.listPublicCards();
    expect(pub).toHaveLength(1);
    expect(pub[0]).toMatchObject({ id: "k001", validated: true, validatedBy: "Dr. Pengawas" });
  });

  it("perubahan isi tidak mengubah versi yang tayang sampai disetujui lagi", async () => {
    const store = await freshStore("false");
    await store.transitionCard("k001", "setujui", "Dr. Pengawas", "pengawas");
    const card = structuredClone((await store.getCard("k001"))!);
    await store.updateCardContent("k001", { ...card.content, summary: "Ringkasan baru yang cukup panjang." }, "Kurator A", "kurator");

    const updated = (await store.getCard("k001"))!;
    expect(updated.workflow).toBe("draf");
    expect(updated.version).toBe(2);
    const pub = (await store.getPublicCard(card.content.slug))!;
    expect(pub.content.summary).toBe(card.content.summary);
    expect(pub.version).toBe(1);
    expect(updated.history.map((h) => h.version)).toEqual([1, 1, 2]);
  });

  it("menolak wajib disertai alasan", async () => {
    const store = await freshStore("false");
    await expect(store.transitionCard("k002", "tolak", "Dr. P", "pengawas", "")).rejects.toThrow(/Alasan/);
    await store.transitionCard("k002", "tolak", "Dr. P", "pengawas", "Nomor fatwa keliru");
    expect((await store.getCard("k002"))!.workflow).toBe("ditolak");
  });

  it("dua salinan modul dalam satu proses berbagi data yang sama", async () => {
    const a = await freshStore("true");
    vi.resetModules();
    const b = await import("@/lib/store");
    expect(b).not.toBe(a);
    await a.logQuestion({ text: "pinjol", cardIds: ["k006"], answered: true, mode: "pencocokan" });
    await b.addFeedback("k006", false);
    await a.transitionCard("k006", "setujui", "Dr. P", "pengawas");
    expect(await b.listQuestions()).toHaveLength(1);
    expect(await a.listFeedback()).toHaveLength(1);
    expect((await b.getCard("k006"))!.published).toBeDefined();
  });

  it("menyimpan ke file dan memuat ulang", async () => {
    const store = await freshStore("true");
    await store.addFeedback("k003", true);
    await store.addQueueItem("laporan", "Nomor fatwa salah ketik", "k003");
    store.__resetCache();
    expect(await store.listFeedback()).toHaveLength(1);
    expect(await store.listQueue()).toHaveLength(1);
  });
});
