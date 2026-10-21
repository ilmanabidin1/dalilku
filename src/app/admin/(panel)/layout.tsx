import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { logoutAction } from "../actions";

export const metadata: Metadata = { title: "Panel kurator", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireSession();
  return (
    <div className="container wide">
      <div className="actions-row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <p className="small muted" style={{ margin: 0 }}>
          Masuk sebagai <strong>{session.name}</strong> ({session.role === "pengawas" ? "dewan pengawas" : "kurator"})
        </p>
        <form action={logoutAction}>
          <button className="btn btn-sm">Keluar</button>
        </form>
      </div>
      <nav className="admin-nav" aria-label="Navigasi admin">
        <Link className="btn btn-sm" href="/admin">
          Statistik
        </Link>
        <Link className="btn btn-sm" href="/admin/kartu">
          Kartu
        </Link>
        <Link className="btn btn-sm" href="/admin/antrean">
          Antrean
        </Link>
        <Link className="btn btn-sm" href="/admin/kartu/baru">
          + Kartu baru
        </Link>
      </nav>
      {children}
    </div>
  );
}
