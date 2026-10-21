import { z } from "zod";
import { ask } from "@/lib/ask";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const Body = z.object({ question: z.string().trim().min(3).max(500) });

export async function POST(req: Request) {
  if (!rateLimit(clientKey(req, "ask"), 20, 60_000)) {
    return Response.json({ error: "Terlalu banyak pertanyaan. Coba lagi sebentar lagi." }, { status: 429 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Pertanyaan minimal 3 dan maksimal 500 karakter." }, { status: 400 });
  }
  const result = await ask(parsed.data.question);
  return Response.json(result);
}
