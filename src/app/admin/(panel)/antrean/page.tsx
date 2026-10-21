import Link from "next/link";
import { listCards, listQueue } from "@/lib/store";
import { queueAction } from "../../actions";

export default async function QueuePage({ searchParams }: PageProps<"/admin/antrean">) {
  const { semua } = await searchParams;
  const [queue, cards] = await Promise.all([listQueue(), listCards()]);
  const items = semua ? queue : queue.filter((q) => q.state === "baru" || q.state === "diproses");
  const title = (id?: string) => cards.find((c) => c.id === id)?.content.title;

  return (
    <div className="stack">
      <h1>Antrean laporan dan usulan topik</h1>
      <p className="small muted">
        Laporan kesalahan ditinjau paling lambat 7 hari. Usulan topik berasal dari pertanyaan tanpa rujukan.{" "}
        {semua ? <Link href="/admin/antrean">Hanya yang terbuka</Link> : <Link href="/admin/antrean?semua=1">Tampilkan semua</Link>}
      </p>
      {items.length === 0 ? <p className="notice">Antrean kosong.</p> : null}
      {items.map((q) => {
        const age = Math.floor((Date.now() - Date.parse(q.at)) / 864e5);
        const late = q.kind === "laporan" && age > 7 && (q.state === "baru" || q.state === "diproses");
        return (
          <article key={q.id} className="card stack">
            <div className="actions-row">
              <span className={`badge ${q.kind === "laporan" ? "badge-merah" : "badge-biru"}`}>
                {q.kind === "laporan" ? "Laporan kesalahan" : "Usulan topik"}
              </span>
              <span className="small muted">
                {new Date(q.at).toLocaleString("id-ID")} · {q.state}
              </span>
              {late ? <span className="small" style={{ color: "var(--merah)" }}>Lewat 7 hari</span> : null}
            </div>
            {q.cardId ? (
              <p className="small">
                Kartu: <Link href={`/admin/kartu/${q.cardId}`}>{title(q.cardId) ?? q.cardId}</Link>
              </p>
            ) : null}
            <p>{q.text}</p>
            {q.resolutionNote ? <p className="small muted">Catatan: {q.resolutionNote}</p> : null}
            <form action={queueAction.bind(null, q.id)} className="actions-row">
              <label htmlFor={`note-${q.id}`} className="sr-only">
                Catatan
              </label>
              <input id={`note-${q.id}`} name="note" type="text" placeholder="Catatan tindak lanjut" style={{ flex: 1, minWidth: 180 }} />
              <button className="btn btn-sm" name="state" value="diproses">
                Proses
              </button>
              <button className="btn btn-sm" name="state" value="selesai">
                Selesai
              </button>
              <button className="btn btn-sm btn-danger" name="state" value="ditolak">
                Tolak
              </button>
            </form>
          </article>
        );
      })}
    </div>
  );
}
