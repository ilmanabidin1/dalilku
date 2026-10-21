import Link from "next/link";
import { TopicBrowser } from "@/components/TopicBrowser";
import { listPublicCards, showDrafts } from "@/lib/store";
import { STATUSES, STATUS_INFO } from "@/lib/types";
import { TAGLINE } from "@/lib/site";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

const CONTOH = ["Paylater halal nggak?", "Boleh beli saham syariah?", "Hukum tabungan emas digital", "Ikut MLM boleh?"];

export default async function HomePage() {
  const cards = await listPublicCards();
  const hasDrafts = cards.some((c) => !c.validated);

  return (
    <div className="container stack">
      <section className="hero">
        <h1>{TAGLINE}</h1>
        <p className="muted">
          Cek status syariah transaksi keuangan sehari-hari, lengkap dengan rujukan fatwa dan alternatif syariahnya.
          Dalilku tidak berfatwa: kami memetakan pertanyaan Anda ke fatwa yang sudah ada.
        </p>
        <form action="/tanya" method="get" className="ask-form" role="search">
          <label htmlFor="q" className="sr-only">
            Pertanyaan
          </label>
          <input id="q" name="q" type="search" placeholder="Tulis pertanyaan, misal: pinjol itu riba?" required />
          <button className="btn btn-primary">Tanya</button>
        </form>
        <div className="chips" style={{ marginTop: 10 }}>
          {CONTOH.map((q) => (
            <Link key={q} className="chip" href={`/tanya?q=${encodeURIComponent(q)}`}>
              {q}
            </Link>
          ))}
        </div>
      </section>

      {hasDrafts && showDrafts() ? (
        <p className="notice notice-warn">
          Mode prototipe: kartu bertanda draf belum disetujui dewan pengawas syariah. Jangan dijadikan pegangan sebelum
          divalidasi.
        </p>
      ) : null}

      <section className="card" aria-labelledby="arti-status">
        <h2 id="arti-status">Empat status</h2>
        <ul className="topic-list">
          {STATUSES.map((s) => (
            <li key={s}>
              <StatusBadge status={s} /> <span className="small">{STATUS_INFO[s].arti}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="topik" aria-labelledby="judul-topik">
        <h2 id="judul-topik">Topik populer</h2>
        {cards.length ? (
          <TopicBrowser cards={cards} />
        ) : (
          <p className="notice">Belum ada kartu yang disetujui dewan pengawas.</p>
        )}
      </section>
    </div>
  );
}
