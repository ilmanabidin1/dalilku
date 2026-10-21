import Link from "next/link";
import { listCards, listFeedback, listQuestions, listQueue } from "@/lib/store";

function pct(n: number, d: number) {
  return d ? Math.round((n / d) * 100) : 0;
}

export default async function DashboardPage() {
  const [cards, feedback, questions, queue] = await Promise.all([
    listCards(),
    listFeedback(),
    listQuestions(),
    listQueue(),
  ]);

  const answered = questions.filter((q) => q.answered).length;
  const aiAnswered = questions.filter((q) => q.mode === "ai").length;
  const helpful = feedback.filter((f) => f.helpful).length;
  const openQueue = queue.filter((q) => q.state === "baru" || q.state === "diproses");
  const overdue = openQueue.filter((q) => q.kind === "laporan" && Date.now() - Date.parse(q.at) > 7 * 864e5);
  const byWorkflow = (w: string) => cards.filter((c) => c.workflow === w).length;
  const published = cards.filter((c) => c.published).length;

  const perCard = cards
    .map((c) => {
      const asked = questions.filter((q) => q.cardIds[0] === c.id).length;
      const fb = feedback.filter((f) => f.cardId === c.id);
      return { card: c, asked, fb: fb.length, helpful: fb.filter((f) => f.helpful).length };
    })
    .sort((a, b) => b.asked - a.asked || b.fb - a.fb);

  const unanswered = questions.filter((q) => !q.answered).slice(-15).reverse();

  return (
    <div className="stack">
      <h1>Statistik</h1>
      <p className="small muted">Semua data tanpa identitas pengguna.</p>

      <div className="stat-grid">
        <div className="card stat">
          <div className="value">{questions.length}</div>
          <div className="label">Pertanyaan</div>
        </div>
        <div className="card stat">
          <div className="value">{pct(answered, questions.length)}%</div>
          <div className="label">Terjawab dari kartu ({aiAnswered} dengan ringkasan AI)</div>
        </div>
        <div className="card stat">
          <div className="value">{pct(helpful, feedback.length)}%</div>
          <div className="label">Penilaian &quot;membantu&quot; ({feedback.length} penilaian, target 75%)</div>
        </div>
        <div className="card stat">
          <div className="value">
            {published}/{cards.length}
          </div>
          <div className="label">Kartu disetujui dewan pengawas</div>
        </div>
        <div className="card stat">
          <div className="value">{openQueue.length}</div>
          <div className="label">
            Antrean terbuka{overdue.length ? `, ${overdue.length} laporan lewat 7 hari` : ""}
          </div>
        </div>
      </div>

      <section className="card">
        <h2>Alur kerja kartu</h2>
        <p className="small">
          Draf: {byWorkflow("draf")} · Tinjauan: {byWorkflow("tinjauan")} · Disetujui: {byWorkflow("disetujui")} ·
          Ditolak: {byWorkflow("ditolak")}
        </p>
      </section>

      <section className="card">
        <h2>Per topik</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Topik</th>
                <th>Ditanyakan</th>
                <th>Membantu</th>
              </tr>
            </thead>
            <tbody>
              {perCard.map(({ card, asked, fb, helpful: h }) => (
                <tr key={card.id}>
                  <td>
                    <Link href={`/admin/kartu/${card.id}`}>{card.content.title}</Link>
                  </td>
                  <td>{asked}</td>
                  <td style={{ minWidth: 120 }}>
                    {fb ? (
                      <>
                        <div className="bar" aria-hidden>
                          <span style={{ width: `${pct(h, fb)}%` }} />
                        </div>
                        <span className="small">
                          {pct(h, fb)}% dari {fb}
                        </span>
                      </>
                    ) : (
                      <span className="muted small">belum ada</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Pertanyaan tanpa rujukan terbaru</h2>
        {unanswered.length ? (
          <ul>
            {unanswered.map((q) => (
              <li key={q.id}>
                {q.text} <span className="muted small">({new Date(q.at).toLocaleString("id-ID")})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Belum ada.</p>
        )}
      </section>
    </div>
  );
}
