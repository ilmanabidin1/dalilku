import Link from "next/link";
import type { PublicCard, Reference } from "@/lib/types";
import { STATUS_INFO } from "@/lib/types";
import { ASK_EXPERT_URL, DISCLAIMER } from "@/lib/site";
import { DraftBadge, StatusBadge } from "./StatusBadge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function RefItem({ r }: { r: Reference }) {
  return (
    <li className="ref">
      <div>
        <span className="ref-inst">{r.institution}</span>
        {r.number ? (
          <>
            {" "}
            <span className="ref-num">No. {r.number}</span>
          </>
        ) : null}
        {r.year && !r.number?.includes(String(r.year)) ? <span> ({r.year})</span> : null}
      </div>
      <div>{r.title}</div>
      {r.position ? <div className="muted small">{r.position}</div> : null}
      {r.url ? (
        <div className="small">
          <a href={r.url} target="_blank" rel="noopener noreferrer">
            Cek di situs resmi {r.institution}
          </a>
        </div>
      ) : null}
      {!r.verified ? <span className="ref-flag">Belum dicocokkan kurator dengan dokumen resmi</span> : null}
    </li>
  );
}

/** Kartu jawaban dengan urutan baku sesuai PRD (9 bagian). */
export function AnswerCard({
  card,
  headingLevel = 1,
  compact = false,
}: {
  card: PublicCard;
  headingLevel?: 1 | 2;
  compact?: boolean;
}) {
  const c = card.content;
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <article className="card answer-card" aria-labelledby={`judul-${card.id}`}>
      {!card.validated ? (
        <div className="draft-banner" role="note">
          <strong>Draf.</strong> Kartu ini belum disetujui dewan pengawas syariah dan ditampilkan untuk uji
          prototipe. Status dan nomor rujukan bisa berubah.
        </div>
      ) : null}

      {/* 1. Nama transaksi dan status */}
      <header>
        <Heading id={`judul-${card.id}`}>{c.title}</Heading>
        <div className="actions-row">
          <StatusBadge status={c.status} />
          {!card.validated ? <DraftBadge /> : null}
          <span className="muted small">{c.category}</span>
        </div>
      </header>

      {/* 2. Ringkasan */}
      <p className="summary">{c.summary}</p>

      {compact ? null : (
        <>
          {/* 3. Alasan */}
          <section className="answer-section">
            <h3>Alasan</h3>
            <ul>
              {c.reasons.map((r, i) => (
                <li key={i}>
                  {r.term ? <span className="term">{r.term}: </span> : null}
                  {r.text}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {/* 4. Rujukan Indonesia */}
      <section className="answer-section">
        <h3>Rujukan utama</h3>
        {c.references.length ? (
          <ul className="ref-list stack">
            {c.references.map((r, i) => (
              <RefItem key={i} r={r} />
            ))}
          </ul>
        ) : (
          <p className="muted">Belum ada rujukan resmi yang tercatat.</p>
        )}
      </section>

      {compact ? null : (
        <>
          {/* 5. Rujukan pembanding */}
          {c.comparisons.length ? (
            <section className="answer-section">
              <h3>Pendapat dan rujukan pembanding</h3>
              <ul className="ref-list stack">
                {c.comparisons.map((r, i) => (
                  <RefItem key={i} r={r} />
                ))}
              </ul>
            </section>
          ) : null}

          {/* 6. Status regulasi */}
          {c.regulation ? (
            <section className="answer-section">
              <h3>Status regulasi</h3>
              <p>{c.regulation}</p>
            </section>
          ) : null}

          {/* 7. Syarat (status bersyarat) */}
          {c.conditions.length ? (
            <section className="answer-section">
              <h3>Syarat</h3>
              <ul>
                {c.conditions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* 8. Alternatif syariah */}
          {c.alternatives.length ? (
            <section className="answer-section">
              <h3>Alternatif syariah</h3>
              <ul>
                {c.alternatives.map((a, i) => (
                  <li key={i}>
                    <strong>{a.name}.</strong> {a.description}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}

      {/* 9. Penafian */}
      <section className="answer-section disclaimer">
        <p>
          <strong>Arti status:</strong> {STATUS_INFO[c.status].arti}
        </p>
        <p>
          {DISCLAIMER} <Link href={ASK_EXPERT_URL}>Tanyakan ke ahli</Link>.
        </p>
        <p>
          {card.validated && card.validatedAt
            ? `Divalidasi ${formatDate(card.validatedAt)} oleh ${card.validatedBy}. Versi ${card.version}.`
            : `Versi draf ${card.version}, diperbarui ${formatDate(card.updatedAt)}.`}
        </p>
      </section>
    </article>
  );
}
