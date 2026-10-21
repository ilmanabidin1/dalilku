import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnswerCard } from "@/components/AnswerCard";
import { FeedbackBox, ShareButtons } from "@/components/CardActions";
import { getPublicCard } from "@/lib/store";
import { STATUS_INFO } from "@/lib/types";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/t/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const card = await getPublicCard(slug);
  if (!card) return { title: "Topik tidak ditemukan" };
  const title = `${card.content.title}: ${STATUS_INFO[card.content.status].label}`;
  return {
    title,
    description: card.content.summary,
    alternates: { canonical: `/t/${slug}` },
    openGraph: { title, description: card.content.summary, url: `/t/${slug}`, type: "article" },
    // Draf tidak diindeks mesin pencari sampai disetujui dewan pengawas.
    robots: card.validated ? undefined : { index: false, follow: true },
  };
}

export default async function TopicPage({ params }: PageProps<"/t/[slug]">) {
  const { slug } = await params;
  const card = await getPublicCard(slug);
  if (!card) notFound();

  const url = `${siteUrl()}/t/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Bagaimana status syariah ${card.content.title}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${STATUS_INFO[card.content.status].label}. ${card.content.summary}`,
        },
      },
    ],
  };

  return (
    <div className="container stack">
      <nav className="small">
        <Link href="/#topik">Semua topik</Link> / {card.content.category}
      </nav>
      <AnswerCard card={card} />
      <ShareButtons title={card.content.title} url={url} />
      <FeedbackBox cardId={card.id} />
      {card.validated ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      ) : null}
    </div>
  );
}
