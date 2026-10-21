export const STATUSES = ["tidak-sesuai", "diperselisihkan", "bersyarat", "sesuai"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_INFO: Record<Status, { label: string; arti: string; color: string }> = {
  "tidak-sesuai": {
    label: "Tidak sesuai syariah",
    arti: "Fatwa rujukan utama menyatakannya tidak sesuai, tanpa perbedaan berarti.",
    color: "merah",
  },
  diperselisihkan: {
    label: "Diperselisihkan",
    arti: "Lembaga atau ulama yang kredibel berbeda pendapat.",
    color: "kuning",
  },
  bersyarat: {
    label: "Sesuai bersyarat",
    arti: "Boleh jika syarat tertentu terpenuhi.",
    color: "biru",
  },
  sesuai: {
    label: "Sesuai syariah",
    arti: "Fatwa rujukan menyatakannya sesuai.",
    color: "hijau",
  },
};

export const CATEGORIES = [
  "Perbankan",
  "Pembiayaan",
  "Fintech",
  "Pinjaman informal",
  "Investasi",
  "Trading",
  "Aset digital",
  "Pasar modal",
  "Asuransi",
  "Sosial",
  "Skema berisiko",
  "Judi",
] as const;
export type Category = (typeof CATEGORIES)[number];

/** Alur kerja konten: draf -> tinjauan -> disetujui / ditolak. */
export const WORKFLOWS = ["draf", "tinjauan", "disetujui", "ditolak"] as const;
export type Workflow = (typeof WORKFLOWS)[number];

export interface Reference {
  /** Lembaga penerbit, mis. "DSN-MUI". */
  institution: string;
  /** Nomor dokumen persis seperti di dokumen resmi, mis. "25/DSN-MUI/III/2002". */
  number?: string;
  year?: number;
  title: string;
  url?: string;
  /** Untuk rujukan pembanding: ringkasan posisi lembaga tersebut. */
  position?: string;
  /** Sudah dicocokkan kurator dengan dokumen resmi. */
  verified: boolean;
}

export interface Reason {
  /** Istilah teknis yang diberi arti, mis. "riba". Opsional. */
  term?: string;
  text: string;
}

export interface Alternative {
  name: string;
  description: string;
}

export interface CardContent {
  slug: string;
  title: string;
  category: Category;
  status: Status;
  summary: string;
  reasons: Reason[];
  references: Reference[];
  comparisons: Reference[];
  regulation?: string;
  conditions: string[];
  alternatives: Alternative[];
  /** Kata kunci dan sinonim untuk pencarian. */
  keywords: string[];
  /** Catatan kurator untuk dewan pengawas (tidak tampil ke publik). */
  curatorNote?: string;
}

export interface CardVersion {
  version: number;
  content: CardContent;
  workflow: Workflow;
  by: string;
  role: Role;
  at: string;
  note?: string;
}

export interface Card {
  id: string;
  content: CardContent;
  workflow: Workflow;
  version: number;
  updatedAt: string;
  reviewNote?: string;
  /** Versi terakhir yang disetujui dewan pengawas; inilah yang tayang ke publik. */
  published?: {
    content: CardContent;
    version: number;
    validatedAt: string;
    validatedBy: string;
  };
  history: CardVersion[];
}

/** Kartu sebagaimana ditampilkan ke publik. */
export interface PublicCard {
  id: string;
  content: CardContent;
  version: number;
  /** false bila kartu belum disetujui dewan pengawas (mode pratinjau draf). */
  validated: boolean;
  validatedAt?: string;
  validatedBy?: string;
  updatedAt: string;
}

export type Role = "kurator" | "pengawas" | "sistem";

export interface Feedback {
  id: string;
  cardId: string;
  helpful: boolean;
  at: string;
}

export type QueueKind = "laporan" | "usulan";
export type QueueState = "baru" | "diproses" | "selesai" | "ditolak";

export interface QueueItem {
  id: string;
  kind: QueueKind;
  /** Kartu terkait untuk laporan kesalahan. */
  cardId?: string;
  text: string;
  state: QueueState;
  at: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

/** Log pertanyaan tanpa identitas pengguna. */
export interface QuestionLog {
  id: string;
  text: string;
  at: string;
  cardIds: string[];
  answered: boolean;
  mode: "ai" | "pencocokan" | "tanpa-rujukan";
}

export interface StoreData {
  cards: Card[];
  feedback: Feedback[];
  queue: QueueItem[];
  questions: QuestionLog[];
}
