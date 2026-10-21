"use client";

import { useState } from "react";

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Gagal mengirim");
}

export function ShareButtons({ title, url }: { title: string; url: string }) {
  const text = `${title}: cek status syariah dan rujukan fatwanya di Dalilku\n${url}`;
  return (
    <div className="actions-row">
      <a
        className="btn btn-sm"
        href={`https://wa.me/?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Bagikan ke WhatsApp
      </a>
      <button
        type="button"
        className="btn btn-sm"
        onClick={async () => {
          if (navigator.share) {
            await navigator.share({ title, url }).catch(() => undefined);
          } else {
            await navigator.clipboard?.writeText(url);
            alert("Tautan disalin.");
          }
        }}
      >
        Salin tautan
      </button>
    </div>
  );
}

export function FeedbackBox({ cardId }: { cardId: string }) {
  const [voted, setVoted] = useState<null | boolean>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [report, setReport] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function vote(helpful: boolean) {
    setVoted(helpful);
    await post("/api/feedback", { cardId, helpful }).catch(() => setVoted(null));
  }

  async function sendReport(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      await post("/api/laporan", { cardId, text: report });
      setStatus("sent");
      setReport("");
    } catch (err) {
      setError((err as Error).message);
      setStatus("error");
    }
  }

  return (
    <div className="card stack">
      <div>
        <p style={{ fontWeight: 600 }}>Apakah jawaban ini membantu?</p>
        {voted === null ? (
          <div className="actions-row">
            <button type="button" className="btn btn-sm" onClick={() => vote(true)}>
              Ya, membantu
            </button>
            <button type="button" className="btn btn-sm" onClick={() => vote(false)}>
              Belum membantu
            </button>
          </div>
        ) : (
          <p className="muted">Terima kasih atas penilaian Anda.</p>
        )}
      </div>
      <div>
        {!reportOpen ? (
          <button type="button" className="btn btn-sm btn-danger" onClick={() => setReportOpen(true)}>
            Laporkan kesalahan
          </button>
        ) : status === "sent" ? (
          <p className="notice notice-ok">
            Laporan diterima dan akan ditinjau kurator serta dewan pengawas paling lambat 7 hari.
          </p>
        ) : (
          <form onSubmit={sendReport}>
            <div className="field">
              <label htmlFor={`lapor-${cardId}`}>Apa yang keliru?</label>
              <textarea
                id={`lapor-${cardId}`}
                value={report}
                onChange={(e) => setReport(e.target.value)}
                placeholder="Misal: nomor fatwa salah, status kurang tepat, ada fatwa yang lebih baru. Jangan tulis data pribadi."
                required
                minLength={10}
                maxLength={2000}
              />
            </div>
            {status === "error" ? <p className="notice notice-error">{error}</p> : null}
            <button className="btn btn-sm btn-primary" disabled={status === "sending"}>
              {status === "sending" ? "Mengirim..." : "Kirim laporan"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
