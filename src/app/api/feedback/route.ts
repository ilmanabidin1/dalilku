import { z } from "zod";
import { addFeedback } from "@/lib/store";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const Body = z.object({ cardId: z.string().max(20), helpful: z.boolean() });

export async function POST(req: Request) {
  if (!rateLimit(clientKey(req, "feedback"), 30, 60_000)) {
    return Response.json({ error: "Terlalu banyak permintaan." }, { status: 429 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Data tidak valid." }, { status: 400 });
  try {
    await addFeedback(parsed.data.cardId, parsed.data.helpful);
  } catch {
    return Response.json({ error: "Kartu tidak ditemukan." }, { status: 404 });
  }
  return Response.json({ ok: true });
}
