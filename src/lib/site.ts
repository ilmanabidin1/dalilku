export const SITE_NAME = "Dalilku";
export const TAGLINE = "Tabayyun dulu sebelum transaksi.";
export const SITE_DESCRIPTION =
  "Cek status syariah transaksi keuangan sehari-hari, lengkap dengan rujukan fatwa Indonesia dan internasional serta alternatif syariahnya.";

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export const DISCLAIMER =
  "Dalilku menyajikan rujukan fatwa untuk edukasi. Ini bukan fatwa baru dan bukan nasihat investasi. Untuk kasus spesifik, tanyakan kepada ahli atau lembaga fatwa.";

export const ASK_EXPERT_URL = "/tentang#tanya-ahli";
