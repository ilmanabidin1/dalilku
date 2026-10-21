import { CATEGORIES, STATUSES, type CardContent, type Category, type Reference, type Status } from "./types";

/*
 * Konversi kartu <-> isian formulir admin. Daftar ditulis satu butir per baris
 * agar kurator tidak perlu menyunting JSON.
 */

export const FORMAT_HINTS = {
  reasons: "Satu alasan per baris. Awali dengan istilah lalu \"::\" bila perlu. Contoh: riba :: Bunga adalah tambahan atas utang.",
  references:
    "Satu rujukan per baris: Lembaga | Nomor | Tahun | Judul | URL | Terverifikasi (ya/tidak). Kolom kosong boleh dibiarkan.",
  comparisons:
    "Satu rujukan per baris: Lembaga | Nomor | Tahun | Judul | Ringkasan posisi | URL | Terverifikasi (ya/tidak).",
  conditions: "Satu syarat per baris. Wajib diisi untuk status \"Sesuai bersyarat\".",
  alternatives: "Satu alternatif per baris: Nama :: Penjelasan.",
  keywords: "Pisahkan dengan koma. Masukkan sinonim dan nama produk yang sering ditanyakan.",
} as const;

function lines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function cells(line: string): string[] {
  return line.split("|").map((c) => c.trim());
}

function yes(v: string | undefined): boolean {
  return /^(ya|y|yes|true|1|sudah)$/i.test(v ?? "");
}

function optionalYear(v: string | undefined, lineNo: number): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1900 || n > 2100) throw new FormError(`Tahun tidak valid di baris ${lineNo}: "${v}"`);
  return n;
}

function optionalUrl(v: string | undefined, lineNo: number): string | undefined {
  if (!v) return undefined;
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
    return v;
  } catch {
    throw new FormError(`URL tidak valid di baris ${lineNo}: "${v}"`);
  }
}

export class FormError extends Error {}

export function parseReferences(text: string, withPosition: boolean): Reference[] {
  return lines(text).map((line, i) => {
    const c = cells(line);
    const lineNo = i + 1;
    const [institution, number, year, title] = c;
    const position = withPosition ? c[4] : undefined;
    const url = withPosition ? c[5] : c[4];
    const verified = withPosition ? c[6] : c[5];
    if (!institution || !title) throw new FormError(`Lembaga dan judul wajib diisi di baris ${lineNo}`);
    const ref: Reference = { institution, title, verified: yes(verified) };
    if (number) ref.number = number;
    const y = optionalYear(year, lineNo);
    if (y) ref.year = y;
    if (position) ref.position = position;
    const u = optionalUrl(url, lineNo);
    if (u) ref.url = u;
    return ref;
  });
}

export function formatReferences(refs: Reference[], withPosition: boolean): string {
  return refs
    .map((r) => {
      const base = [r.institution, r.number ?? "", r.year ? String(r.year) : "", r.title];
      const rest = withPosition ? [r.position ?? "", r.url ?? "", r.verified ? "ya" : "tidak"] : [r.url ?? "", r.verified ? "ya" : "tidak"];
      return [...base, ...rest].join(" | ");
    })
    .join("\n");
}

function splitPair(line: string): [string | undefined, string] {
  const idx = line.indexOf("::");
  if (idx === -1) return [undefined, line];
  return [line.slice(0, idx).trim() || undefined, line.slice(idx + 2).trim()];
}

export function contentFromForm(form: FormData): CardContent {
  const get = (k: string) => String(form.get(k) ?? "").trim();

  const slug = get("slug");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new FormError("Slug hanya boleh huruf kecil, angka, dan tanda hubung (misal: paylater-berbunga)");
  }
  const title = get("title");
  if (title.length < 3) throw new FormError("Nama transaksi wajib diisi");
  const category = get("category") as Category;
  if (!CATEGORIES.includes(category)) throw new FormError("Kategori tidak valid");
  const status = get("status") as Status;
  if (!STATUSES.includes(status)) throw new FormError("Status tidak valid");
  const summary = get("summary");
  if (summary.length < 20) throw new FormError("Ringkasan terlalu pendek");

  const reasons = lines(get("reasons")).map((l) => {
    const [term, text] = splitPair(l);
    return term ? { term, text } : { text };
  });
  if (!reasons.length) throw new FormError("Minimal satu alasan");

  const references = parseReferences(get("references"), false);
  const comparisons = parseReferences(get("comparisons"), true);
  const conditions = lines(get("conditions"));
  if (status === "bersyarat" && !conditions.length) throw new FormError("Status bersyarat wajib memuat syarat");

  const alternatives = lines(get("alternatives")).map((l, i) => {
    const [name, description] = splitPair(l);
    if (!name) throw new FormError(`Alternatif baris ${i + 1} harus berformat "Nama :: Penjelasan"`);
    return { name, description };
  });

  const keywords = get("keywords")
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
  if (!keywords.length) throw new FormError("Minimal satu kata kunci");

  const content: CardContent = {
    slug,
    title,
    category,
    status,
    summary,
    reasons,
    references,
    comparisons,
    conditions,
    alternatives,
    keywords,
  };
  const regulation = get("regulation");
  if (regulation) content.regulation = regulation;
  const curatorNote = get("curatorNote");
  if (curatorNote) content.curatorNote = curatorNote;
  return content;
}

export function formValues(c: CardContent) {
  return {
    slug: c.slug,
    title: c.title,
    category: c.category,
    status: c.status,
    summary: c.summary,
    reasons: c.reasons.map((r) => (r.term ? `${r.term} :: ${r.text}` : r.text)).join("\n"),
    references: formatReferences(c.references, false),
    comparisons: formatReferences(c.comparisons, true),
    regulation: c.regulation ?? "",
    conditions: c.conditions.join("\n"),
    alternatives: c.alternatives.map((a) => `${a.name} :: ${a.description}`).join("\n"),
    keywords: c.keywords.join(", "),
    curatorNote: c.curatorNote ?? "",
  };
}
