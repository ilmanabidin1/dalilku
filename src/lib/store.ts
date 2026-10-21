import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { SEED_CARDS } from "@/data/seed-cards";
import type {
  Card,
  CardContent,
  Feedback,
  PublicCard,
  QueueItem,
  QueueKind,
  QueueState,
  QuestionLog,
  Role,
  StoreData,
  Workflow,
} from "./types";

/*
 * Penyimpanan berbasis satu file JSON. Cukup untuk prototipe satu server
 * (Railway dengan volume). Skema PostgreSQL sasaran ada di db/schema.sql;
 * fungsi-fungsi di modul ini adalah batas yang diganti saat pindah ke Postgres.
 */

// Lokasi data ditentukan saat runtime, jadi dikecualikan dari pelacakan berkas build.
const STORE_PATH = path.resolve(/*turbopackIgnore: true*/ process.env.STORE_PATH ?? ".data/store.json");

/*
 * Next.js dapat memuat modul ini lebih dari sekali dalam satu proses (bundel
 * route handler dan bundel server component terpisah). Cache dan antrean tulis
 * disimpan di globalThis agar semua salinan modul berbagi status yang sama, dan
 * mtime file dicek supaya perubahan dari luar proses ikut terbaca.
 */
interface StoreState {
  cache: StoreData | null;
  mtimeMs: number;
  writeChain: Promise<unknown>;
}
const globalStore = globalThis as typeof globalThis & { __dalilkuStore?: StoreState };
const state: StoreState = (globalStore.__dalilkuStore ??= {
  cache: null,
  mtimeMs: 0,
  writeChain: Promise.resolve(),
});

function now() {
  return new Date().toISOString();
}

export function seedStore(): StoreData {
  const at = now();
  return {
    cards: SEED_CARDS.map((content, i) => ({
      id: `k${String(i + 1).padStart(3, "0")}`,
      content,
      workflow: "tinjauan" as Workflow,
      version: 1,
      updatedAt: at,
      history: [
        {
          version: 1,
          content,
          workflow: "tinjauan",
          by: "Draf awal PRD",
          role: "sistem",
          at,
          note: "Draf awal dari PRD, menunggu validasi dewan pengawas.",
        },
      ],
    })),
    feedback: [],
    queue: [],
    questions: [],
  };
}

async function load(): Promise<StoreData> {
  try {
    const { mtimeMs } = await fs.stat(/*turbopackIgnore: true*/ STORE_PATH);
    if (state.cache && mtimeMs === state.mtimeMs) return state.cache;
    state.cache = JSON.parse(await fs.readFile(/*turbopackIgnore: true*/ STORE_PATH, "utf8")) as StoreData;
    state.mtimeMs = mtimeMs;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    state.cache = seedStore();
    await persist(state.cache);
  }
  return state.cache;
}

async function persist(data: StoreData) {
  await fs.mkdir(/*turbopackIgnore: true*/ path.dirname(STORE_PATH), { recursive: true });
  const tmp = `${STORE_PATH}.${process.pid}.tmp`;
  await fs.writeFile(/*turbopackIgnore: true*/ tmp, JSON.stringify(data, null, 2));
  await fs.rename(/*turbopackIgnore: true*/ tmp, STORE_PATH);
  state.mtimeMs = (await fs.stat(/*turbopackIgnore: true*/ STORE_PATH)).mtimeMs;
}

/** Menjalankan perubahan secara berurutan agar tulisan tidak saling menimpa. */
function mutate<T>(fn: (data: StoreData) => T): Promise<T> {
  const run = state.writeChain.then(async () => {
    const data = await load();
    const result = fn(data);
    await persist(data);
    return result;
  });
  state.writeChain = run.catch(() => undefined);
  return run;
}

export function showDrafts(): boolean {
  const flag = process.env.SHOW_DRAFT_CARDS;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export function toPublic(card: Card, drafts = showDrafts()): PublicCard | null {
  if (card.published) {
    return {
      id: card.id,
      content: card.published.content,
      version: card.published.version,
      validated: true,
      validatedAt: card.published.validatedAt,
      validatedBy: card.published.validatedBy,
      updatedAt: card.published.validatedAt,
    };
  }
  if (drafts && card.workflow !== "ditolak") {
    return {
      id: card.id,
      content: card.content,
      version: card.version,
      validated: false,
      updatedAt: card.updatedAt,
    };
  }
  return null;
}

// ---------- Baca ----------

export async function listPublicCards(): Promise<PublicCard[]> {
  const data = await load();
  return data.cards.map((c) => toPublic(c)).filter((c): c is PublicCard => c !== null);
}

export async function getPublicCard(slug: string): Promise<PublicCard | null> {
  const cards = await listPublicCards();
  return cards.find((c) => c.content.slug === slug) ?? null;
}

export async function listCards(): Promise<Card[]> {
  return (await load()).cards;
}

export async function getCard(id: string): Promise<Card | null> {
  return (await load()).cards.find((c) => c.id === id) ?? null;
}

export async function listQueue(): Promise<QueueItem[]> {
  return [...(await load()).queue].sort((a, b) => b.at.localeCompare(a.at));
}

export async function listQuestions(): Promise<QuestionLog[]> {
  return (await load()).questions;
}

export async function listFeedback(): Promise<Feedback[]> {
  return (await load()).feedback;
}

// ---------- Tulis: publik ----------

export function addFeedback(cardId: string, helpful: boolean) {
  return mutate((d) => {
    if (!d.cards.some((c) => c.id === cardId)) throw new Error("Kartu tidak ditemukan");
    d.feedback.push({ id: randomUUID(), cardId, helpful, at: now() });
  });
}

export function addQueueItem(kind: QueueKind, text: string, cardId?: string) {
  return mutate((d) => {
    if (cardId && !d.cards.some((c) => c.id === cardId)) throw new Error("Kartu tidak ditemukan");
    const item: QueueItem = { id: randomUUID(), kind, text, cardId, state: "baru", at: now() };
    d.queue.push(item);
    return item;
  });
}

export function logQuestion(entry: Omit<QuestionLog, "id" | "at">) {
  return mutate((d) => {
    const log: QuestionLog = { id: randomUUID(), at: now(), ...entry };
    d.questions.push(log);
    return log;
  });
}

// ---------- Tulis: admin ----------

export class WorkflowError extends Error {}

function findCard(d: StoreData, id: string): Card {
  const card = d.cards.find((c) => c.id === id);
  if (!card) throw new WorkflowError("Kartu tidak ditemukan");
  return card;
}

function pushHistory(card: Card, by: string, role: Role, note?: string) {
  card.history.push({
    version: card.version,
    content: card.content,
    workflow: card.workflow,
    by,
    role,
    at: card.updatedAt,
    note,
  });
}

export function createCard(content: CardContent, by: string) {
  return mutate((d) => {
    if (d.cards.some((c) => c.content.slug === content.slug)) {
      throw new WorkflowError("Slug sudah dipakai kartu lain");
    }
    const max = d.cards.reduce((m, c) => Math.max(m, Number(c.id.slice(1)) || 0), 0);
    const card: Card = {
      id: `k${String(max + 1).padStart(3, "0")}`,
      content,
      workflow: "draf",
      version: 1,
      updatedAt: now(),
      history: [],
    };
    pushHistory(card, by, "kurator", "Kartu baru");
    d.cards.push(card);
    return card;
  });
}

/** Menyimpan perubahan isi. Kartu kembali menjadi draf; versi yang tayang tidak berubah. */
export function updateCardContent(id: string, content: CardContent, by: string, role: Role, note?: string) {
  return mutate((d) => {
    const card = findCard(d, id);
    if (d.cards.some((c) => c.id !== id && c.content.slug === content.slug)) {
      throw new WorkflowError("Slug sudah dipakai kartu lain");
    }
    card.content = content;
    card.version += 1;
    card.workflow = "draf";
    card.updatedAt = now();
    card.reviewNote = undefined;
    pushHistory(card, by, role, note ?? "Isi kartu diubah");
    return card;
  });
}

const TRANSITIONS: Record<string, { from: Workflow[]; to: Workflow; role: Role[] }> = {
  ajukan: { from: ["draf", "ditolak"], to: "tinjauan", role: ["kurator", "pengawas"] },
  setujui: { from: ["tinjauan"], to: "disetujui", role: ["pengawas"] },
  tolak: { from: ["tinjauan"], to: "ditolak", role: ["pengawas"] },
};
export type TransitionAction = keyof typeof TRANSITIONS;

export function transitionCard(id: string, action: string, by: string, role: Role, note?: string) {
  return mutate((d) => {
    const rule = TRANSITIONS[action];
    if (!rule) throw new WorkflowError("Aksi tidak dikenal");
    if (!rule.role.includes(role)) throw new WorkflowError("Peran Anda tidak berwenang untuk aksi ini");
    const card = findCard(d, id);
    if (!rule.from.includes(card.workflow)) {
      throw new WorkflowError(`Kartu berstatus "${card.workflow}", tidak bisa di-${action}`);
    }
    if (action === "tolak" && !note?.trim()) throw new WorkflowError("Alasan penolakan wajib diisi");
    card.workflow = rule.to;
    card.updatedAt = now();
    card.reviewNote = note?.trim() || undefined;
    if (rule.to === "disetujui") {
      card.published = {
        content: card.content,
        version: card.version,
        validatedAt: card.updatedAt,
        validatedBy: by,
      };
    }
    pushHistory(card, by, role, note?.trim() || `Status: ${rule.to}`);
    return card;
  });
}

/** Menarik kartu dari tayangan publik (misal karena fatwa baru). */
export function unpublishCard(id: string, by: string, note: string) {
  return mutate((d) => {
    const card = findCard(d, id);
    if (!note.trim()) throw new WorkflowError("Alasan penarikan wajib diisi");
    card.published = undefined;
    if (card.workflow === "disetujui") card.workflow = "draf";
    card.updatedAt = now();
    pushHistory(card, by, "pengawas", `Ditarik dari publik: ${note.trim()}`);
    return card;
  });
}

export function setQueueState(id: string, state: QueueState, note?: string) {
  return mutate((d) => {
    const item = d.queue.find((q) => q.id === id);
    if (!item) throw new WorkflowError("Item antrean tidak ditemukan");
    item.state = state;
    item.resolutionNote = note?.trim() || item.resolutionNote;
    if (state === "selesai" || state === "ditolak") item.resolvedAt = now();
    return item;
  });
}

/** Hanya untuk pengujian. */
export function __resetCache() {
  state.cache = null;
  state.mtimeMs = 0;
  state.writeChain = Promise.resolve();
}
