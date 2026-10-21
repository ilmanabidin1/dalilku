import { z } from "zod";
import { addQueueItem } from "@/lib/store";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const Body = z.object({
  cardId: z.string().max(20).optional(),
  text: z.string().trim().min(10).max(2000),
});

export async function POST(req: Request) {
  if (!rateLimit(clientKey(req, "laporan"), 5, 60_000)) {
    return Response.json({ error: "Terlalu banyak laporan. Coba lagi sebentar lagi." }, { status: 429 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Laporan minimal 10 karakter." }, { status: 400 });
  try {
    await addQueueItem(parsed.data.cardId ? "laporan" : "usulan", parsed.data.text, parsed.data.cardId);
  } catch {
    return Response.json({ error: "Kartu tidak ditemukan." }, { status: 404 });
  }
  return Response.json({ ok: true });
}
