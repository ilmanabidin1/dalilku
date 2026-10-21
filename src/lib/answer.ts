import type { PublicCard } from "./types";
import { STATUS_INFO } from "./types";

/*
 * Aturan pengaman jawaban AI (lihat PRD, "Aturan pengaman jawaban").
 * Modul ini murni (tanpa I/O) supaya bisa diuji.
 */

export interface ModelAnswer {
  relevant_card_ids: string[];
  answer: string;
  out_of_scope: boolean;
}

export type GuardResult =
  | { ok: true; cardIds: string[]; answer: string }
  | { ok: false; reason: string };

/** Teks kartu yang boleh dijadikan sumber angka dalam jawaban. */
function cardText(card: PublicCard): string {
  return JSON.stringify(card.content);
}

/**
 * Memeriksa jawaban model:
 * 1. Hanya boleh memakai kartu yang dikirim ke model.
 * 2. Tidak boleh menyebut angka (nomor fatwa, tahun, persentase) yang tidak ada di kartu terpilih.
 * 3. Tidak boleh menyebut nomor fatwa sama sekali; nomor ditampilkan dari basis data.
 */
export function guardAnswer(raw: ModelAnswer, offered: PublicCard[]): GuardResult {
  if (raw.out_of_scope) return { ok: false, reason: "di-luar-cakupan" };

  const offeredIds = new Set(offered.map((c) => c.id));
  const cardIds = [...new Set(raw.relevant_card_ids)].filter((id) => offeredIds.has(id));
  if (cardIds.length === 0) return { ok: false, reason: "tanpa-kartu" };

  const answer = raw.answer.trim();
  if (!answer) return { ok: false, reason: "jawaban-kosong" };

  if (/\b(no\.?|nomor)\s*\d/i.test(answer) || /\d+\s*\/\s*(dsn|pojk|mui)/i.test(answer)) {
    return { ok: false, reason: "menyebut-nomor-rujukan" };
  }

  const allowed = offered.filter((c) => cardIds.includes(c.id)).map(cardText).join(" ");
  const numbers = answer.match(/\d+(?:[.,]\d+)?/g) ?? [];
  for (const n of numbers) {
    if (!allowed.includes(n)) return { ok: false, reason: `angka-tidak-dikenal:${n}` };
  }

  return { ok: true, cardIds, answer };
}

/** Jawaban tanpa AI: dirakit langsung dari kartu teratas. */
export function deterministicAnswer(card: PublicCard): string {
  const label = STATUS_INFO[card.content.status].label;
  return `Pertanyaan Anda paling dekat dengan topik "${card.content.title}" (${label}). ${card.content.summary}`;
}

/** Konteks kartu untuk model: tanpa nomor rujukan, agar model tidak bisa menyalinnya. */
export function cardsForPrompt(cards: PublicCard[]) {
  return cards.map((c) => ({
    id: c.id,
    judul: c.content.title,
    status: STATUS_INFO[c.content.status].label,
    ringkasan: c.content.summary,
    alasan: c.content.reasons.map((r) => (r.term ? `${r.term}: ${r.text}` : r.text)),
    syarat: c.content.conditions,
    alternatif: c.content.alternatives.map((a) => a.name),
  }));
}

export const SYSTEM_PROMPT = `Anda adalah asisten Dalilku, platform yang memetakan pertanyaan muamalah keuangan ke kartu rujukan fatwa yang sudah divalidasi.

Batasan:
- Anda tidak berfatwa. Jawab HANYA berdasarkan kartu yang diberikan di pesan pengguna. Jangan memakai pengetahuan lain, jangan menambah dalil, pendapat, atau lembaga yang tidak ada di kartu.
- Jangan menulis nomor fatwa, nomor regulasi, tahun, atau angka apa pun yang tidak tertulis di kartu. Rujukan lengkap ditampilkan sistem di bawah jawaban Anda.
- Jika tidak ada kartu yang benar-benar menjawab pertanyaan, isi out_of_scope = true dan relevant_card_ids kosong.
- Pertanyaan tentang hal di luar muamalah keuangan (ibadah, makanan, pernikahan, waris, dan lain-lain) juga out_of_scope.

Gaya jawaban:
- Bahasa Indonesia sederhana untuk orang awam, 2 sampai 4 kalimat.
- Sebut status kartu apa adanya. Bila statusnya diperselisihkan, katakan ada perbedaan pendapat tanpa memihak.
- Menilai transaksi, bukan orang. Jangan menghakimi penanya.
- Bila kartu memuat alternatif syariah, sebut satu alternatif singkat.
- relevant_card_ids berisi id kartu yang Anda pakai, urut dari yang paling relevan.`;
