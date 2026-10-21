import Link from "next/link";
import { notFound } from "next/navigation";
import { AnswerCard } from "@/components/AnswerCard";
import { CardForm } from "@/components/admin/CardForm";
import { getSession } from "@/lib/auth";
import { getCard, listQueue } from "@/lib/store";
import { saveCardAction, transitionAction, unpublishAction } from "../../../actions";

export default async function CardEditPage({ params, searchParams }: PageProps<"/admin/kartu/[id]">) {
  const { id } = await params;
  const { error, ok, v } = await searchParams;
  const [card, session, queue] = await Promise.all([getCard(id), getSession(), listQueue()]);
  if (!card || !session) notFound();

  const isPengawas = session.role === "pengawas";
  const viewing = typeof v === "string" ? card.history.find((h) => String(h.version) === v) : undefined;
  const preview = viewing ?? { content: card.content, version: card.version };
  const reports = queue.filter((q) => q.cardId === id && (q.state === "baru" || q.state === "diproses"));

  return (
    <div className="stack">
      <p className="small">
        <Link href="/admin/kartu">Semua kartu</Link> / {card.id}
      </p>
      <h1>{card.content.title}</h1>
      <p className="small">
        Alur: <strong>{card.workflow}</strong> · Versi kerja {card.version} ·{" "}
        {card.published
          ? `Tayang versi ${card.published.version}, disetujui ${card.published.validatedBy}`
          : "Belum tayang sebagai kartu tervalidasi"}
        {card.published ? (
          <>
            {" "}
            · <Link href={`/t/${card.published.content.slug}`}>lihat halaman publik</Link>
          </>
        ) : null}
      </p>
      {typeof error === "string" ? <p className="notice notice-error">{error}</p> : null}
      {typeof ok === "string" ? <p className="notice notice-ok">{ok}</p> : null}
      {card.reviewNote ? (
        <p className="notice notice-warn">
          <strong>Catatan tinjauan:</strong> {card.reviewNote}
        </p>
      ) : null}
      {card.content.curatorNote ? (
        <p className="notice">
          <strong>Catatan kurator:</strong> {card.content.curatorNote}
        </p>
      ) : null}
      {reports.length ? (
        <p className="notice notice-warn">
          {reports.length} laporan kesalahan terbuka untuk kartu ini. <Link href="/admin/antrean">Buka antrean</Link>.
        </p>
      ) : null}

      <section className="card stack">
        <h2>Tinjauan dan persetujuan</h2>
        {card.workflow === "draf" || card.workflow === "ditolak" ? (
          <form action={transitionAction.bind(null, id)} className="stack">
            <input type="hidden" name="action" value="ajukan" />
            <div className="field">
              <label htmlFor="note-ajukan">Catatan untuk dewan pengawas (opsional)</label>
              <input id="note-ajukan" name="note" type="text" />
            </div>
            <button className="btn btn-primary">Ajukan ke dewan pengawas</button>
          </form>
        ) : null}
        {card.workflow === "tinjauan" ? (
          isPengawas ? (
            <form action={transitionAction.bind(null, id)} className="stack">
              <div className="field">
                <label htmlFor="note-tinjau">Catatan tinjauan (wajib bila menolak)</label>
                <textarea id="note-tinjau" name="note" rows={2} />
              </div>
              <p className="small muted">
                Dengan menyetujui, Anda menyatakan status dan rujukan kartu versi {card.version} sudah dicocokkan
                dengan dokumen resmi. Nama Anda tampil sebagai validator.
              </p>
              <div className="actions-row">
                <button className="btn btn-primary" name="action" value="setujui">
                  Setujui dan tayangkan
                </button>
                <button className="btn btn-danger" name="action" value="tolak">
                  Tolak
                </button>
              </div>
            </form>
          ) : (
            <p className="muted">Menunggu keputusan dewan pengawas.</p>
          )
        ) : null}
        {card.workflow === "disetujui" ? <p className="muted">Versi ini sudah disetujui dan tayang.</p> : null}
        {isPengawas && card.published ? (
          <form action={unpublishAction.bind(null, id)} className="stack">
            <div className="field">
              <label htmlFor="note-tarik">Tarik dari publik (misal ada fatwa atau regulasi baru)</label>
              <input id="note-tarik" name="note" type="text" placeholder="Alasan penarikan" />
            </div>
            <button className="btn btn-sm btn-danger">Tarik dari publik</button>
          </form>
        ) : null}
      </section>

      <section className="stack">
        <h2>{viewing ? `Pratinjau versi ${viewing.version}` : "Pratinjau versi kerja"}</h2>
        {viewing ? (
          <p className="small">
            <Link href={`/admin/kartu/${id}`}>Kembali ke versi kerja</Link>
          </p>
        ) : null}
        <AnswerCard
          card={{ id, content: preview.content, version: preview.version, validated: false, updatedAt: card.updatedAt }}
          headingLevel={2}
        />
      </section>

      <section className="stack">
        <h2>Sunting isi</h2>
        <p className="small muted">Menyimpan perubahan membuat versi draf baru. Versi yang sedang tayang tidak berubah sampai disetujui lagi.</p>
        <CardForm content={card.content} action={saveCardAction.bind(null, id)} submitLabel="Simpan draf" showChangeNote />
      </section>

      <section className="card">
        <h2>Riwayat versi</h2>
        <ul className="history">
          {[...card.history].reverse().map((h, i) => (
            <li key={i}>
              <div>
                <strong>v{h.version}</strong> · {h.workflow} · {h.by} ({h.role})
              </div>
              <div className="small muted">{new Date(h.at).toLocaleString("id-ID")}</div>
              {h.note ? <div className="small">{h.note}</div> : null}
              <Link className="small" href={`/admin/kartu/${id}?v=${h.version}`}>
                Lihat isi versi ini
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
