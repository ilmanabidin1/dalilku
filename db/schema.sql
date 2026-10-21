-- Skema sasaran PostgreSQL + pgvector untuk tahap setelah prototipe.
-- Prototipe saat ini memakai src/lib/store.ts (file JSON) dengan struktur data yang sama.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE cards (
  id            text PRIMARY KEY,
  slug          text UNIQUE NOT NULL,
  workflow      text NOT NULL CHECK (workflow IN ('draf', 'tinjauan', 'disetujui', 'ditolak')),
  version       integer NOT NULL,
  content       jsonb NOT NULL,               -- CardContent versi kerja
  review_note   text,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Versi yang tayang ke publik (disetujui dewan pengawas).
CREATE TABLE card_publications (
  card_id       text PRIMARY KEY REFERENCES cards(id),
  version       integer NOT NULL,
  content       jsonb NOT NULL,
  validated_at  timestamptz NOT NULL,
  validated_by  text NOT NULL,
  embedding     vector(1024)                  -- untuk pencarian semantik
);

CREATE TABLE card_versions (
  card_id   text NOT NULL REFERENCES cards(id),
  seq       serial,
  version   integer NOT NULL,
  workflow  text NOT NULL,
  content   jsonb NOT NULL,
  actor     text NOT NULL,
  role      text NOT NULL,
  note      text,
  at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (card_id, seq)
);

CREATE TABLE feedback (
  id        uuid PRIMARY KEY,
  card_id   text NOT NULL REFERENCES cards(id),
  helpful   boolean NOT NULL,
  at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE queue_items (
  id               uuid PRIMARY KEY,
  kind             text NOT NULL CHECK (kind IN ('laporan', 'usulan')),
  card_id          text REFERENCES cards(id),
  text             text NOT NULL,
  state            text NOT NULL DEFAULT 'baru',
  at               timestamptz NOT NULL DEFAULT now(),
  resolved_at      timestamptz,
  resolution_note  text
);

-- Tanpa kolom identitas pengguna (UU PDP).
CREATE TABLE questions (
  id        uuid PRIMARY KEY,
  text      text NOT NULL,
  card_ids  text[] NOT NULL DEFAULT '{}',   -- untuk audit: kartu yang dipakai jawaban
  answered  boolean NOT NULL,
  mode      text NOT NULL,
  at        timestamptz NOT NULL DEFAULT now()
);
