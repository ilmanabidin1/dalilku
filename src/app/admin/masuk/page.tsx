import type { Metadata } from "next";
import { loginAction } from "../actions";

export const metadata: Metadata = { title: "Masuk panel kurator", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/admin/masuk">) {
  const { error } = await searchParams;
  return (
    <div className="container stack" style={{ maxWidth: 420 }}>
      <h1>Panel kurator</h1>
      <p className="muted">Untuk kurator konten dan dewan pengawas syariah.</p>
      {typeof error === "string" ? <p className="notice notice-error">{error}</p> : null}
      <form action={loginAction} className="card">
        <div className="field">
          <label htmlFor="name">Nama lengkap</label>
          <input id="name" name="name" type="text" required autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="role">Peran</label>
          <select id="role" name="role">
            <option value="kurator">Kurator konten</option>
            <option value="pengawas">Dewan pengawas syariah</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="password">Kata sandi</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        <button className="btn btn-primary">Masuk</button>
      </form>
    </div>
  );
}
