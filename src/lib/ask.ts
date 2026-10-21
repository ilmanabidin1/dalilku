import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { addQueueItem, listPublicCards, logQuestion } from "./store";
import { searchCards } from "./search";
import { cardsForPrompt, deterministicAnswer, guardAnswer, SYSTEM_PROMPT } from "./answer";
import type { PublicCard } from "./types";

const AnswerSchema = z.object({
  relevant_card_ids: z.array(z.string()),
  answer: z.string(),
  out_of_scope: z.boolean(),
});

export type AskResult =
  | {
      kind: "jawaban";
      mode: "ai" | "pencocokan";
      answer: string;
      cards: PublicCard[];
      questionId: string;
    }
  | { kind: "tanpa-rujukan"; questionId: string };

let client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  client ??= new Anthropic();
  return client;
}

async function askModel(question: string, offered: PublicCard[]) {
  const anthropic = getClient();
  if (!anthropic) return null;
  try {
    const response = await anthropic.messages.parse(
      {
        model: process.env.ANTHROPIC_MODEL || "claude-opus-5-5",
        max_tokens: 4000,
        // Konsistensi dijaga dengan effort rendah + format terstruktur + pengaman di backend.
        // (Model terbaru tidak menerima parameter temperature.)
        output_config: { effort: "low", format: zodOutputFormat(AnswerSchema) },
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Kartu tervalidasi:\n${JSON.stringify(cardsForPrompt(offered), null, 2)}\n\nPertanyaan pengguna:\n${question}`,
          },
        ],
      },
      { timeout: 30_000 },
    );
    if (response.stop_reason === "refusal" || !response.parsed_output) return null;
    return response.parsed_output;
  } catch (err) {
    console.error("[ask] gagal memanggil model, beralih ke pencocokan kartu:", err);
    return null;
  }
}

export async function ask(question: string): Promise<AskResult> {
  const cards = await listPublicCards();
  const hits = searchCards(question, cards, 3);

  if (hits.length === 0) {
    const log = await logQuestion({ text: question, cardIds: [], answered: false, mode: "tanpa-rujukan" });
    await addQueueItem("usulan", question);
    return { kind: "tanpa-rujukan", questionId: log.id };
  }

  const offered = hits.map((h) => h.card);
  const modelAnswer = await askModel(question, offered);

  if (modelAnswer) {
    const guarded = guardAnswer(modelAnswer, offered);
    if (guarded.ok) {
      const used = guarded.cardIds.map((id) => offered.find((c) => c.id === id)!);
      const log = await logQuestion({ text: question, cardIds: guarded.cardIds, answered: true, mode: "ai" });
      return { kind: "jawaban", mode: "ai", answer: guarded.answer, cards: used, questionId: log.id };
    }
    if (guarded.reason === "di-luar-cakupan") {
      const log = await logQuestion({ text: question, cardIds: [], answered: false, mode: "tanpa-rujukan" });
      await addQueueItem("usulan", question);
      return { kind: "tanpa-rujukan", questionId: log.id };
    }
    console.warn(`[ask] jawaban model ditolak pengaman (${guarded.reason}); memakai jawaban kartu.`);
  }

  const top = offered[0];
  const log = await logQuestion({
    text: question,
    cardIds: offered.map((c) => c.id),
    answered: true,
    mode: "pencocokan",
  });
  return { kind: "jawaban", mode: "pencocokan", answer: deterministicAnswer(top), cards: offered, questionId: log.id };
}
