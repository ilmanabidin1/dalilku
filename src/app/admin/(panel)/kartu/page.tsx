import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { listCards } from "@/lib/store";
import { WORKFLOWS } from "@/lib/types";

export default async function CardsAdminPage({ searchParams }: PageProps<"/admin/kartu">) {
  const { alur } = await searchParams;
  const all = await listCards();
  const cards = typeof alur === "string" ? all.filter((c) => c.workflow === alur) : all;
  const sixMonths = 182 * 864e5;

  return (
    <div className="stack">
      <h1>Kartu jawaban</h1>
      <div className="chips">
        <Link className="chip" aria-pressed={!alur} href="/admin/kartu">
          Semua ({all.length})
        </Link>
        {WORKFLOWS.map((w) => (
          <Link key={w} className="chip" aria-pressed={alur === w} href={`/admin/kartu?alur=${w}`}>
            {w} ({all.filter((c) => c.workflow === w).length})
          </Link>
        ))}
      </div>
      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Transaksi</th>
              <th>Status syariah</th>
              <th>Alur</th>
              <th>Tayang</th>
              <th>Versi</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((c) => {
              const due = c.published && Date.now() - Date.parse(c.published.validatedAt) > sixMonths;
              return (
                <tr key={c.id}>
                  <td className="small">{c.id}</td>
                  <td>
                    <Link href={`/admin/kartu/${c.id}`}>{c.content.title}</Link>
                    <div className="small muted">{c.content.category}</div>
                  </td>
                  <td>
                    <StatusBadge status={c.content.status} />
                  </td>
                  <td>{c.workflow}</td>
                  <td className="small">
                    {c.published ? `v${c.published.version}` : "belum"}
                    {due ? <div style={{ color: "var(--merah)" }}>perlu tinjau ulang 6 bulan</div> : null}
                  </td>
                  <td>{c.version}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
