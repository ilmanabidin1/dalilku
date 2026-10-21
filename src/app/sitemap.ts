import type { MetadataRoute } from "next";
import { listPublicCards } from "@/lib/store";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  // Hanya kartu tervalidasi yang diumumkan ke mesin pencari.
  const cards = (await listPublicCards()).filter((c) => c.validated);
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/tentang`, changeFrequency: "monthly", priority: 0.5 },
    ...cards.map((c) => ({
      url: `${base}/t/${c.content.slug}`,
      lastModified: c.validatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
