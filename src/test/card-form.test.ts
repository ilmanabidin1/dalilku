import { describe, expect, it } from "vitest";
import { SEED_CARDS } from "@/data/seed-cards";
import { contentFromForm, formValues } from "@/lib/card-form";

function toForm(values: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(values)) f.set(k, v);
  return f;
}

describe("formulir kartu", () => {
  it("bolak-balik tanpa kehilangan data untuk semua kartu awal", () => {
    for (const card of SEED_CARDS) {
      expect(contentFromForm(toForm(formValues(card)))).toEqual(card);
    }
  });

  it("mewajibkan syarat untuk status bersyarat", () => {
    const v = formValues(SEED_CARDS.find((c) => c.status === "bersyarat")!);
    expect(() => contentFromForm(toForm({ ...v, conditions: "" }))).toThrow(/syarat/);
  });

  it("menolak slug dan URL tidak valid", () => {
    const v = formValues(SEED_CARDS[0]);
    expect(() => contentFromForm(toForm({ ...v, slug: "Slug Salah" }))).toThrow(/Slug/);
    expect(() =>
      contentFromForm(toForm({ ...v, references: "MUI | 1 | 2004 | Judul | javascript:alert(1) | ya" })),
    ).toThrow(/URL/);
  });
});
