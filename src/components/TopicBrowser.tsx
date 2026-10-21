"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { filterCards } from "@/lib/search";
import { CATEGORIES, STATUSES, STATUS_INFO, type PublicCard, type Status } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function TopicBrowser({ cards }: { cards: PublicCard[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);

  const filtered = useMemo(() => {
    return filterCards(query, cards).filter(
      (c) => (!category || c.content.category === category) && (!status || c.content.status === status),
    );
  }, [cards, query, category, status]);

  const usedCategories = CATEGORIES.filter((cat) => cards.some((c) => c.content.category === cat));
  const grouped = usedCategories
    .map((cat) => ({ cat, items: filtered.filter((c) => c.content.category === cat) }))
    .filter((g) => g.items.length);

  return (
    <div>
      <div className="field">
        <label htmlFor="saring">Saring topik</label>
        <input
          id="saring"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Misal: emas, saham, asuransi"
        />
      </div>

      <p className="small muted" id="label-status">
        Status
      </p>
      <div className="chips" role="group" aria-labelledby="label-status">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className="chip"
            aria-pressed={status === s}
            onClick={() => setStatus(status === s ? null : s)}
          >
            {STATUS_INFO[s].label}
          </button>
        ))}
      </div>

      <p className="small muted" id="label-kategori" style={{ marginTop: 12 }}>
        Kategori
      </p>
      <div className="chips" role="group" aria-labelledby="label-kategori">
        {usedCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            className="chip"
            aria-pressed={category === cat}
            onClick={() => setCategory(category === cat ? null : cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="small muted" aria-live="polite" style={{ marginTop: 12 }}>
        {filtered.length} dari {cards.length} topik
      </p>

      {grouped.length === 0 ? (
        <p className="notice">
          Tidak ada topik yang cocok. Coba <Link href={`/tanya?q=${encodeURIComponent(query)}`}>tanyakan langsung</Link>.
        </p>
      ) : (
        grouped.map(({ cat, items }) => (
          <section key={cat} aria-label={cat}>
            <h3 className="category-heading">{cat}</h3>
            <ul className="topic-list">
              {items.map((c) => (
                <li key={c.id}>
                  <Link href={`/t/${c.content.slug}`} className="topic">
                    <span className="topic-title">{c.content.title}</span>
                    <span>
                      <StatusBadge status={c.content.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
