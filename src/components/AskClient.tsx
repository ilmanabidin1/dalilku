"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicCard } from "@/lib/types";
import { AnswerCard } from "./AnswerCard";
import { FeedbackBox } from "./CardActions";

type Result =
  | { kind: "jawaban"; mode: "ai" | "pencocokan"; answer: string; cards: PublicCard[] }
  | { kind: "tanpa-rujukan" };

export function AskClient({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const asked = useRef(false);

  const submit = useCallback(async (q: string) => {
    const text = q.trim();
    if (text.length < 3) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Terjadi kesalahan");
      setResult(data);
      const url = new URL(window.location.href);
      url.searchParams.set("q", text);
      window.history.replaceState(null, "", url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery && !asked.current) {
      asked.current = true;
      void submit(initialQuery);
    }
  }, [initialQuery, submit]);

  return (
    <div className="stack">
      <form
        className="ask-form"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          void submit(query);
        }}
      >
        <label htmlFor="tanya" className="sr-only">
          Pertanyaan
        </label>
        <input
          id="tanya"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Misal: kredit motor di leasing itu riba?"
          maxLength={500}
          required
        />
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Mencari..." : "Tanya"}
        </button>
      </form>
      <p className="small muted">
        Jawaban hanya disusun dari kartu rujukan yang sudah dikurasi. Pertanyaan disimpan tanpa identitas untuk evaluasi.{" "}
        <Link href="/privasi">Selengkapnya</Link>.
      </p>

      <div aria-live="polite">
        {error ? <p className="notice notice-error">{error}</p> : null}

        {result?.kind === "tanpa-rujukan" ? (
          <div className="card stack">
            <h2>Belum ada rujukan</h2>
            <p>
              Kami belum memiliki kartu rujukan tervalidasi untuk pertanyaan ini, jadi kami tidak menjawabnya. Pertanyaan
              Anda sudah dicatat sebagai usulan topik untuk kurator.
            </p>
            <p>
              Untuk saat ini, silakan tanyakan kepada ahli atau lembaga fatwa. <Link href="/tentang#tanya-ahli">Lihat
              caranya</Link>, atau <Link href="/#topik">telusuri topik yang tersedia</Link>.
            </p>
          </div>
        ) : null}

        {result?.kind === "jawaban" ? (
          <div className="stack">
            <div className="card">
              <p className="small muted">
                {result.mode === "ai"
                  ? "Ringkasan otomatis dari kartu rujukan di bawah"
                  : "Topik yang paling cocok dengan pertanyaan Anda"}
              </p>
              <p className="summary">{result.answer}</p>
            </div>
            {result.cards.map((card, i) => (
              <div key={card.id} className="stack">
                {i === 1 ? <h2 className="category-heading">Topik terkait lainnya</h2> : null}
                <AnswerCard card={card} headingLevel={2} compact={i > 0} />
                {i === 0 ? (
                  <>
                    <p>
                      <Link href={`/t/${card.content.slug}`}>Buka halaman lengkap topik ini</Link>
                    </p>
                    <FeedbackBox cardId={card.id} />
                  </>
                ) : (
                  <p>
                    <Link href={`/t/${card.content.slug}`}>Buka topik</Link>
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
