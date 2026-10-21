import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container stack">
      <h1>Topik belum tersedia</h1>
      <p>Topik ini belum ada atau belum disetujui dewan pengawas.</p>
      <p>
        <Link href="/tanya">Ajukan pertanyaan</Link> agar dicatat sebagai usulan topik, atau{" "}
        <Link href="/#topik">lihat semua topik</Link>.
      </p>
    </div>
  );
}
