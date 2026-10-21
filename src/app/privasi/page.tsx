import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privasi",
  description: "Pemberitahuan pelindungan data pribadi Dalilku.",
};

export default function PrivacyPage() {
  return (
    <div className="container stack">
      <h1>Pemberitahuan privasi</h1>
      <p>
        Pemberitahuan ini disusun dengan mengacu pada UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.
      </p>
      <section className="card stack">
        <h2>Yang kami simpan</h2>
        <ul>
          <li>Teks pertanyaan yang Anda ketik, waktu, dan topik yang dicocokkan.</li>
          <li>Penilaian &quot;membantu&quot; atau &quot;belum membantu&quot; per topik.</li>
          <li>Isi laporan kesalahan dan usulan topik.</li>
        </ul>
        <h2>Yang tidak kami simpan</h2>
        <ul>
          <li>Tidak ada akun, nama, email, nomor telepon, atau alamat IP yang disimpan bersama pertanyaan.</li>
          <li>Alamat IP hanya dipakai sesaat di memori server untuk membatasi penyalahgunaan, lalu dibuang.</li>
        </ul>
        <h2>Untuk apa</h2>
        <p>
          Data dipakai untuk mengevaluasi akurasi jawaban, menentukan topik baru, dan riset literasi keuangan syariah
          dalam bentuk statistik agregat.
        </p>
        <h2>Pemrosesan oleh penyedia AI</h2>
        <p>
          Bila fitur tanya bebas memakai model AI, teks pertanyaan dan kartu rujukan terkait dikirim ke penyedia model
          bahasa untuk disusun menjadi ringkasan.
        </p>
        <p className="notice notice-warn">
          Mohon jangan menulis data pribadi (nama, nomor rekening, nomor KTP) di kotak pertanyaan atau laporan.
        </p>
      </section>
    </div>
  );
}
