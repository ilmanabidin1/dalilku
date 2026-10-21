import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ServiceWorker } from "@/components/ServiceWorker";
import { DISCLAIMER, SITE_DESCRIPTION, SITE_NAME, TAGLINE, siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${SITE_NAME}: ${TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "default" },
  openGraph: { siteName: SITE_NAME, locale: "id_ID", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f6b4f" },
    { media: "(prefers-color-scheme: dark)", color: "#111513" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <a href="#isi" className="sr-only">
          Langsung ke isi
        </a>
        <header className="site-header">
          <div className="container wide">
            <Link href="/" className="logo" aria-label="Dalilku, beranda">
              <span className="logo-mark" aria-hidden>
                D
              </span>
              {SITE_NAME}
            </Link>
            <nav className="site-nav" aria-label="Navigasi utama">
              <Link href="/tanya">Tanya</Link>
              <Link href="/#topik">Topik</Link>
              <Link href="/tentang">Tentang</Link>
            </nav>
          </div>
        </header>
        <main id="isi">{children}</main>
        <footer className="site-footer">
          <div className="container wide">
            <p>
              <strong>{SITE_NAME}</strong>: {TAGLINE}
            </p>
            <p>{DISCLAIMER}</p>
            <nav aria-label="Navigasi bawah">
              <Link href="/tentang">Tentang dan prinsip</Link>
              <Link href="/tentang#tata-kelola">Dewan pengawas</Link>
              <Link href="/privasi">Privasi</Link>
              <Link href="/admin">Panel kurator</Link>
            </nav>
          </div>
        </footer>
        <ServiceWorker />
      </body>
    </html>
  );
}
