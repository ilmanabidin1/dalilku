import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { STATUSES, STATUS_INFO } from "@/lib/types";

export const metadata: Metadata = {
  title: "Tentang dan prinsip",
  description: "Prinsip, basis rujukan, dan tata kelola konten Dalilku.",
};

const PRINSIP = [
  ["Menilai transaksi, bukan orang.", "Tidak ada skor kesalehan dan tidak ada bahasa yang menghakimi."],
  ["Tidak berfatwa.", "AI hanya memetakan pertanyaan ke fatwa dan regulasi yang sudah ada."],
  ["Rujukan wajib.", "Setiap jawaban menyebut lembaga, nomor, dan tahun fatwa yang bisa dicek."],
  ["Jujur saat tidak tahu.", "Jika tidak ada rujukan yang relevan, kami mengatakannya dan menyarankan bertanya ke ahli."],
  [
    "Perbedaan pendapat ditampilkan apa adanya.",
    "Fatwa DSN-MUI menjadi rujukan utama, pendapat lain ditampilkan sebagai pembanding tanpa memihak.",
  ],
  ["Akses informasi dasar gratis.", "Status, rujukan, dan alternatif syariah tidak dikunci di balik pembayaran."],
  ["Independen.", "Kami tidak menerima bayaran dari pihak mana pun untuk memengaruhi penilaian suatu produk."],
];

const RUJUKAN = [
  ["Utama", "Fatwa DSN-MUI (muamalah); Fatwa Komisi Fatwa dan Ijtima Ulama MUI"],
  ["Pembanding nasional", "Bahtsul Masail NU, Majelis Tarjih Muhammadiyah"],
  [
    "Pembanding internasional",
    "Majma' al-Fiqh al-Islami (OKI), Dar al-Ifta Mesir, Shariah Advisory Council Malaysia, Standar Syariah AAOIFI (dirujuk dan diringkas)",
  ],
  ["Regulasi positif", "OJK, Bappebti, Daftar Efek Syariah"],
];

export default function AboutPage() {
  return (
    <div className="container stack">
      <h1>Tentang Dalilku</h1>
      <p>
        Dalilku membantu masyarakat mengetahui status syariah transaksi muamalah keuangan sehari-hari, lengkap dengan
        rujukan fatwa Indonesia dan internasional serta alternatif syariahnya. Dalilku tidak menilai keislaman pengguna
        dan tidak mengeluarkan fatwa.
      </p>

      <section className="card">
        <h2>Tujuh prinsip</h2>
        <ol>
          {PRINSIP.map(([t, d]) => (
            <li key={t}>
              <strong>{t}</strong> {d}
            </li>
          ))}
        </ol>
      </section>

      <section className="card">
        <h2>Arti status</h2>
        <ul className="topic-list">
          {STATUSES.map((s) => (
            <li key={s}>
              <StatusBadge status={s} /> <span className="small">{STATUS_INFO[s].arti}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Basis rujukan</h2>
        <div className="table-wrap">
          <table>
            <tbody>
              {RUJUKAN.map(([l, s]) => (
                <tr key={l}>
                  <th scope="row">{l}</th>
                  <td>{s}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" id="tata-kelola">
        <h2>Tata kelola dan dewan pengawas</h2>
        <p>Tidak ada kartu jawaban yang tayang sebagai kartu tervalidasi tanpa persetujuan dewan pengawas syariah.</p>
        <ol>
          <li>Kurator menyusun draf kartu dari dokumen fatwa asli.</li>
          <li>Dewan pengawas meninjau, mengoreksi, lalu menyetujui atau menolak.</li>
          <li>Kartu yang disetujui tayang dengan tanggal validasi dan nama validator.</li>
          <li>Laporan kesalahan dari pengguna ditinjau paling lambat 7 hari.</li>
          <li>Seluruh kartu ditinjau ulang setiap 6 bulan, atau segera bila ada fatwa atau regulasi baru.</li>
        </ol>
        <p className="notice notice-warn">
          Susunan dewan pengawas syariah sedang dibentuk bersama dosen Fakultas Syariah dan Ekonomi Syariah UNISBA.
          Selama masa prototipe, kartu ditandai sebagai draf.
        </p>
      </section>

      <section className="card" id="tanya-ahli">
        <h2>Tanya ke ahli</h2>
        <p>Untuk kasus spesifik, misalnya akad yang Anda tanda tangani atau produk yang tidak ada di daftar topik:</p>
        <ul>
          <li>Hubungi dewan pengawas syariah (DPS) lembaga keuangan yang menawarkan produk tersebut.</li>
          <li>Ajukan pertanyaan ke Majelis Ulama Indonesia (MUI) setempat atau komisi fatwanya.</li>
          <li>Konsultasikan ke dosen fikih muamalah atau ekonomi syariah di perguruan tinggi terdekat.</li>
          <li>
            Untuk legalitas produk, cek situs <a href="https://www.ojk.go.id">OJK</a> atau kontak OJK 157.
          </li>
        </ul>
        <p>
          Atau <Link href="/tanya">ajukan pertanyaan di Dalilku</Link>; pertanyaan tanpa rujukan dicatat sebagai usulan
          topik baru.
        </p>
      </section>
    </div>
  );
}
