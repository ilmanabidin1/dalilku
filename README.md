# Dalilku

*Tabayyun dulu sebelum transaksi.*

Prototipe web app mobile-first (PWA) untuk mengecek status syariah transaksi muamalah keuangan sehari-hari, lengkap dengan rujukan fatwa Indonesia dan internasional serta alternatif syariahnya. Dalilku tidak berfatwa: sistem memetakan pertanyaan ke kartu rujukan yang dikurasi dan divalidasi dewan pengawas.

## Fitur

- **Beranda**: kotak tanya, 25 topik per kategori, filter kategori dan status (merah, kuning, biru, hijau).
- **Halaman kartu** `/t/<slug>`: format baku 9 bagian (status, ringkasan, alasan, rujukan utama, pembanding, regulasi, syarat, alternatif, penafian), siap dibagikan ke WhatsApp, metadata SEO dan JSON-LD untuk kartu tervalidasi.
- **Tanya bebas** `/tanya`: hanya menjawab dari kartu. Pertanyaan tanpa kartu yang cocok tidak dijawab, dicatat sebagai usulan topik.
- **Umpan balik**: "jawaban ini membantu?" dan "laporkan kesalahan" masuk ke satu antrean.
- **Panel admin** `/admin`: peran kurator dan dewan pengawas, alur draf -> tinjauan -> disetujui/ditolak, riwayat versi, tarik kartu dari publik, antrean laporan (penanda lewat 7 hari), penanda tinjau ulang 6 bulan, dasbor statistik tanpa identitas.
- **PWA**: manifest, ikon, service worker (halaman yang pernah dibuka bisa dibaca luring).

## Pengaman jawaban AI

Diterapkan di `src/lib/ask.ts` dan `src/lib/answer.ts`:

1. Backend memilih kartu dengan pencarian kata kunci (`src/lib/search.ts`); model hanya menerima isi kartu tersebut.
2. Nomor fatwa **tidak** dikirim ke model. Rujukan selalu dirender dari basis data.
3. Jawaban model ditolak bila memakai ID kartu di luar yang diberikan, menyebut nomor rujukan, atau memuat angka yang tidak ada di kartu. Bila ditolak, gagal, atau model menolak menjawab, sistem memakai jawaban langsung dari kartu.
4. Setiap pertanyaan menyimpan ID kartu yang dipakai, untuk audit.
5. Konsistensi: output terstruktur (skema Zod) dengan effort rendah. Model terbaru tidak menerima parameter `temperature`, jadi "suhu rendah" di PRD diganti dengan kombinasi ini.

Tanpa `ANTHROPIC_API_KEY`, tanya bebas tetap berjalan dalam mode pencocokan kartu.

## Menjalankan

```bash
npm install
cp .env.example .env.local   # isi kata sandi admin dan (opsional) ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

Saat development tanpa `.env.local`, kata sandi admin adalah `kurator` dan `pengawas`. Di produksi, `ADMIN_PASSWORD_KURATOR`, `ADMIN_PASSWORD_PENGAWAS`, dan `ADMIN_SESSION_SECRET` wajib diisi.

```bash
npm test        # vitest: data kartu, pencarian, pengaman jawaban, alur kerja, formulir
npm run lint    # typecheck
npm run build && npm start
```

## Status konten

Ke-25 kartu awal (`src/data/seed-cards.ts`) adalah **draf** berstatus `tinjauan`. Semua nomor fatwa, tahun, dan ringkasan posisi lembaga ditandai "belum dicocokkan kurator" dan wajib dicek ke dokumen resmi DSN-MUI, MUI, dan OJK sebelum disetujui. Beberapa kartu memuat catatan kurator untuk rujukan yang belum ditemukan (arisan biasa, binary option, judi/undian, gadai sawah).

`SHOW_DRAFT_CARDS` mengatur apakah draf tampil ke publik (dengan label DRAF dan `noindex`). Default `true` saat development dan `false` di produksi; di produksi hanya kartu yang disetujui dewan pengawas yang tayang.

## Penyimpanan dan deploy

Prototipe menyimpan data di satu file JSON (`STORE_PATH`, default `.data/store.json`), dibuat otomatis dari data awal. Cocok untuk satu instans server, misalnya Railway dengan volume terpasang di lokasi `STORE_PATH`. Tidak cocok untuk hosting serverless dengan sistem berkas hanya-baca. Skema PostgreSQL + pgvector sasaran ada di `db/schema.sql`; fungsi di `src/lib/store.ts` adalah batas yang diganti saat migrasi.

## Struktur

```
src/app/            halaman (beranda, /t/[slug], /tanya, /tentang, /privasi, /admin) dan API
src/components/     kartu jawaban, aksi bagikan/umpan balik, filter topik, formulir admin
src/data/           draf 25 kartu awal
src/lib/            tipe data, penyimpanan, pencarian, pengaman AI, autentikasi admin
src/test/           tes vitest
db/schema.sql       skema PostgreSQL sasaran
```
