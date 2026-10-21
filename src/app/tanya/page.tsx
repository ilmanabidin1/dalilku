import type { Metadata } from "next";
import { AskClient } from "@/components/AskClient";

export const metadata: Metadata = {
  title: "Tanya",
  description: "Tanyakan status syariah transaksi keuangan. Jawaban disusun dari kartu rujukan fatwa yang dikurasi.",
};

export default async function AskPage({ searchParams }: PageProps<"/tanya">) {
  const { q } = await searchParams;
  const initial = typeof q === "string" ? q.slice(0, 500) : "";
  return (
    <div className="container stack">
      <h1>Tanya Dalilku</h1>
      <AskClient key={initial} initialQuery={initial} />
    </div>
  );
}
