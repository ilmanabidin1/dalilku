import { listCards } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Dipakai healthcheck Railway: memastikan server hidup dan penyimpanan bisa dibaca. */
export async function GET() {
  const cards = await listCards();
  return Response.json({ ok: true, cards: cards.length });
}
