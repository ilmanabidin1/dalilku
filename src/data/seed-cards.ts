import type { CardContent, Reference } from "@/lib/types";

/*
 * Draf 25 kartu awal. SEMUA isi di sini adalah draf kurator: nomor fatwa, tahun,
 * dan ringkasan posisi wajib dicocokkan dengan dokumen resmi sebelum kartu
 * disetujui dewan pengawas. Karena itu setiap rujukan bertanda verified: false.
 */

const DSN_URL = "https://dsnmui.or.id/kategori/fatwa/";
const MUI_URL = "https://mui.or.id/produk/fatwa";
const OJK_URL = "https://www.ojk.go.id";

function dsn(number: string, year: number, title: string): Reference {
  return { institution: "DSN-MUI", number, year, title, url: DSN_URL, verified: false };
}

function mui(number: string | undefined, year: number, title: string): Reference {
  return { institution: "MUI", number, year, title, url: MUI_URL, verified: false };
}

function pembanding(
  institution: string,
  title: string,
  position: string,
  extra: Partial<Reference> = {},
): Reference {
  return { institution, title, position, verified: false, ...extra };
}

const FATWA_BUNGA = mui("1 Tahun 2004", 2004, "Fatwa MUI tentang Bunga (Interest/Fa'idah)");
const IJTIMA_VII = mui(
  undefined,
  2021,
  "Keputusan Ijtima Ulama Komisi Fatwa se-Indonesia VII",
);

const MAJMA_BUNGA = pembanding(
  "Majma' al-Fiqh al-Islami (OKI)",
  "Keputusan No. 10 (10/2) Tahun 1985 tentang bunga bank",
  "Setiap tambahan atas utang yang disyaratkan, termasuk bunga bank, adalah riba yang diharamkan.",
  { year: 1985 },
);
const NU_BUNGA = pembanding(
  "Bahtsul Masail NU",
  "Munas Alim Ulama NU 1992 di Bandar Lampung",
  "Mencatat tiga pendapat tentang bunga bank: haram, halal, dan syubhat (samar). Dianjurkan beralih ke lembaga syariah.",
  { year: 1992 },
);
const MUHAMMADIYAH_BUNGA = pembanding(
  "Majelis Tarjih Muhammadiyah",
  "Fatwa Majelis Tarjih tentang bunga bank (2006)",
  "Bunga bank termasuk riba dan hukumnya haram.",
  { year: 2006 },
);

const ALT_BANK_SYARIAH = {
  name: "Bank dan BPR syariah",
  description: "Produk tabungan, deposito, dan pembiayaan dengan akad syariah yang diawasi dewan pengawas syariah.",
};

export const SEED_CARDS: CardContent[] = [
  {
    slug: "tabungan-deposito-bank-konvensional",
    title: "Tabungan dan deposito bank konvensional",
    category: "Perbankan",
    status: "tidak-sesuai",
    summary:
      "Menyimpan uang di tabungan atau deposito berbunga termasuk transaksi riba menurut fatwa MUI, kecuali dalam keadaan darurat bila belum ada bank syariah yang bisa dijangkau.",
    reasons: [
      {
        term: "riba",
        text: "Bunga adalah tambahan yang dijanjikan di depan atas uang yang dipinjamkan. Saat menabung, nasabah pada dasarnya meminjamkan uang ke bank dan menerima bunga sebagai imbalan tetap.",
      },
      {
        text: "Fatwa MUI memberi kelonggaran bagi wilayah yang belum memiliki kantor atau jaringan lembaga keuangan syariah, karena kebutuhan menyimpan uang dengan aman.",
      },
    ],
    references: [FATWA_BUNGA],
    comparisons: [MAJMA_BUNGA, NU_BUNGA, MUHAMMADIYAH_BUNGA],
    regulation: "Produk legal dan diawasi OJK serta dijamin LPS. Status izin tidak menentukan status syariah.",
    conditions: [],
    alternatives: [
      {
        name: "Tabungan wadiah atau mudharabah",
        description: "Tabungan di bank syariah dengan akad titipan atau bagi hasil (Fatwa DSN-MUI No. 02/DSN-MUI/IV/2000).",
      },
      {
        name: "Deposito mudharabah",
        description: "Deposito dengan bagi hasil sesuai nisbah, bukan bunga tetap (Fatwa DSN-MUI No. 03/DSN-MUI/IV/2000).",
      },
    ],
    keywords: ["tabungan", "deposito", "bunga bank", "bank konvensional", "nabung", "rekening", "bunga tabungan", "riba bank"],
  },
  {
    slug: "kpr-kta-bank-konvensional",
    title: "KPR dan KTA bank konvensional",
    category: "Pembiayaan",
    status: "tidak-sesuai",
    summary:
      "KPR dan kredit tanpa agunan dari bank konvensional memakai skema pinjaman berbunga, sehingga termasuk riba menurut fatwa MUI.",
    reasons: [
      {
        term: "riba",
        text: "Bank meminjamkan uang lalu meminta pengembalian lebih besar dalam bentuk bunga, baik bunga tetap maupun mengambang.",
      },
      {
        text: "Denda keterlambatan yang menambah utang dan masuk ke pendapatan bank juga termasuk tambahan atas utang.",
      },
    ],
    references: [FATWA_BUNGA],
    comparisons: [MAJMA_BUNGA, NU_BUNGA],
    regulation: "Produk legal dan diawasi OJK.",
    conditions: [],
    alternatives: [
      {
        name: "KPR syariah murabahah",
        description: "Bank membeli rumah lalu menjualnya ke nasabah dengan harga dan margin yang disepakati di awal (Fatwa DSN-MUI No. 04/DSN-MUI/IV/2000).",
      },
      {
        name: "KPR musyarakah mutanaqisah",
        description: "Kepemilikan bersama rumah yang porsi bank dibeli bertahap oleh nasabah (Fatwa DSN-MUI No. 73/DSN-MUI/XI/2008).",
      },
    ],
    keywords: ["kpr", "kredit rumah", "kta", "kredit tanpa agunan", "pinjaman bank", "cicilan rumah", "kredit pemilikan rumah"],
  },
  {
    slug: "kredit-kendaraan-leasing-konvensional",
    title: "Kredit kendaraan (leasing) konvensional",
    category: "Pembiayaan",
    status: "tidak-sesuai",
    summary:
      "Kredit motor atau mobil lewat leasing konvensional umumnya berbentuk pinjaman berbunga dan denda berbunga, sehingga termasuk riba menurut fatwa MUI.",
    reasons: [
      {
        term: "riba",
        text: "Perusahaan pembiayaan menalangi harga kendaraan lalu menagih kembali dengan bunga. Hitungan bunga flat atau efektif tetap merupakan tambahan atas utang.",
      },
      {
        text: "Denda keterlambatan yang dihitung persentase per hari menambah utang dan menjadi keuntungan perusahaan.",
      },
    ],
    references: [FATWA_BUNGA],
    comparisons: [MAJMA_BUNGA],
    regulation: "Perusahaan pembiayaan diawasi OJK.",
    conditions: [],
    alternatives: [
      {
        name: "Pembiayaan murabahah kendaraan",
        description: "Lembaga syariah membeli kendaraan lalu menjual ke nasabah dengan harga tetap yang dicicil (Fatwa DSN-MUI No. 04/DSN-MUI/IV/2000).",
      },
      {
        name: "Ijarah muntahiyah bit tamlik",
        description: "Sewa kendaraan yang diakhiri perpindahan kepemilikan (Fatwa DSN-MUI No. 27/DSN-MUI/III/2002).",
      },
    ],
    keywords: ["leasing", "kredit motor", "kredit mobil", "cicilan motor", "kendaraan", "multifinance", "dp motor"],
  },
  {
    slug: "kartu-kredit-konvensional-lunas",
    title: "Kartu kredit konvensional yang selalu dilunasi tanpa bunga",
    category: "Pembiayaan",
    status: "diperselisihkan",
    summary:
      "Ulama berbeda pendapat: sebagian membolehkan bila tagihan selalu dilunasi sebelum jatuh tempo, sebagian lain melarang karena akadnya sudah memuat persetujuan membayar bunga.",
    reasons: [
      {
        term: "syarat riba dalam akad",
        text: "Saat mendaftar, pemegang kartu menandatangani perjanjian yang menyetujui bunga jika terlambat. Pendapat yang melarang menilai persetujuan itu sendiri sudah bermasalah.",
      },
      {
        text: "Pendapat yang membolehkan menilai tidak ada bunga yang benar-benar dibayar bila tagihan selalu lunas tepat waktu, dan kartu dibutuhkan untuk transaksi tertentu.",
      },
    ],
    references: [
      dsn("54/DSN-MUI/X/2006", 2006, "Syariah Card (sebagai alternatif)"),
      dsn("42/DSN-MUI/V/2004", 2004, "Syariah Charge Card (sebagai alternatif)"),
    ],
    comparisons: [
      pembanding(
        "Majma' al-Fiqh al-Islami (OKI)",
        "Keputusan No. 108 (2/12) Tahun 2000 tentang kartu kredit",
        "Tidak boleh menerbitkan atau memakai kartu kredit yang mensyaratkan bunga, meskipun pemegang berniat melunasi dalam masa tenggang.",
        { year: 2000 },
      ),
      pembanding(
        "Standar Syariah AAOIFI",
        "Standar Syariah No. 2 tentang kartu debit, charge card, dan kartu kredit",
        "Dirujuk sebagai standar industri; isi diringkas, bukan disalin.",
      ),
    ],
    regulation: "Penerbit kartu kredit diawasi Bank Indonesia dan OJK.",
    conditions: [],
    alternatives: [
      {
        name: "Kartu pembiayaan syariah (iB card)",
        description: "Kartu dengan akad kafalah, qardh, dan ijarah tanpa bunga, sesuai Fatwa DSN-MUI No. 54/DSN-MUI/X/2006.",
      },
      {
        name: "Kartu debit",
        description: "Memakai dana sendiri sehingga tidak ada utang.",
      },
    ],
    keywords: ["kartu kredit", "credit card", "cc", "kartu kredit lunas", "bayar penuh", "full payment", "tanpa bunga"],
  },
  {
    slug: "paylater-berbunga",
    title: "Paylater berbunga",
    category: "Fintech",
    status: "tidak-sesuai",
    summary:
      "Paylater yang mengenakan bunga, biaya layanan per bulan, atau denda keterlambatan berbunga termasuk pinjaman berbunga yang dilarang menurut fatwa MUI, meskipun namanya bukan bunga.",
    reasons: [
      {
        term: "riba",
        text: "Paylater adalah utang. Tambahan yang dihitung dari besar atau lamanya utang, apa pun namanya (biaya layanan, biaya admin bulanan, cicilan 0% dengan biaya), dinilai sebagai bunga.",
      },
      {
        text: "Denda keterlambatan yang bertambah setiap hari dan menjadi keuntungan penyelenggara juga termasuk tambahan atas utang.",
      },
    ],
    references: [FATWA_BUNGA, IJTIMA_VII],
    comparisons: [MAJMA_BUNGA],
    regulation: "Penyelenggara paylater berizin OJK. Izin OJK menunjukkan legalitas, bukan kesesuaian syariah.",
    conditions: [],
    alternatives: [
      {
        name: "Paylater atau fintech syariah",
        description: "Layanan pembiayaan dengan akad syariah yang diawasi dewan pengawas syariah (Fatwa DSN-MUI No. 117/DSN-MUI/II/2018).",
      },
      {
        name: "Menabung dulu atau beli tunai",
        description: "Menghindari utang konsumtif sama sekali.",
      },
    ],
    keywords: ["paylater", "pay later", "bayar nanti", "cicilan 0", "cicilan nol persen", "biaya layanan", "spaylater", "gopaylater", "kredivo", "akulaku"],
  },
  {
    slug: "pinjaman-online-pinjol",
    title: "Pinjaman online (pinjol)",
    category: "Fintech",
    status: "tidak-sesuai",
    summary:
      "Ijtima Ulama MUI 2021 menyatakan pinjaman online yang mengandung riba, ancaman, dan penyebaran data pribadi hukumnya haram, baik pinjol legal maupun ilegal.",
    reasons: [
      {
        term: "riba",
        text: "Pinjol konvensional menagih bunga dan biaya yang dihitung dari pokok dan lamanya pinjaman.",
      },
      {
        term: "zalim",
        text: "Penagihan dengan ancaman, intimidasi, dan penyebaran data peminjam dinilai sebagai perbuatan zalim yang dilarang.",
      },
      {
        text: "Ijtima Ulama juga mengingatkan bahwa menunda bayar utang padahal mampu adalah perbuatan zalim, jadi utang yang sudah diambil tetap wajib dilunasi.",
      },
    ],
    references: [IJTIMA_VII, FATWA_BUNGA],
    comparisons: [MAJMA_BUNGA],
    regulation: "Pinjol legal terdaftar dan berizin OJK. Cek daftar penyelenggara di situs OJK. Pinjol ilegal dapat dilaporkan ke Satgas PASTI.",
    conditions: [],
    alternatives: [
      {
        name: "Fintech pembiayaan syariah",
        description: "Penyelenggara dengan akad syariah dan dewan pengawas syariah (Fatwa DSN-MUI No. 117/DSN-MUI/II/2018).",
      },
      {
        name: "Qardh dari koperasi syariah atau BMT",
        description: "Pinjaman kebajikan tanpa tambahan, biasanya hanya biaya administrasi riil (Fatwa DSN-MUI No. 19/DSN-MUI/IV/2001).",
      },
    ],
    keywords: ["pinjol", "pinjaman online", "pinjaman daring", "fintech lending", "p2p lending", "utang online", "pinjol legal", "pinjol ilegal"],
  },
  {
    slug: "rentenir-bank-emok",
    title: "Rentenir dan bank emok",
    category: "Pinjaman informal",
    status: "tidak-sesuai",
    summary:
      "Meminjamkan uang dengan syarat pengembalian lebih besar, seperti praktik rentenir atau bank emok, termasuk riba yang dilarang.",
    reasons: [
      {
        term: "riba",
        text: "Pinjaman Rp1 juta yang harus dikembalikan Rp1,2 juta adalah contoh paling jelas tambahan atas utang yang disyaratkan.",
      },
      {
        text: "Praktik ini sering disertai tekanan sosial dan penagihan yang memberatkan, sehingga juga menimbulkan kezaliman.",
      },
    ],
    references: [FATWA_BUNGA],
    comparisons: [MAJMA_BUNGA],
    regulation: "Rentenir dan bank emok umumnya tidak berizin OJK.",
    conditions: [],
    alternatives: [
      {
        name: "BMT atau koperasi syariah",
        description: "Pembiayaan mikro dengan akad syariah, termasuk qardh tanpa tambahan (Fatwa DSN-MUI No. 19/DSN-MUI/IV/2001).",
      },
      {
        name: "Program pembiayaan ultra mikro syariah",
        description: "Pembiayaan kelompok usaha mikro oleh lembaga syariah yang diawasi.",
      },
    ],
    keywords: ["rentenir", "bank emok", "bank keliling", "lintah darat", "koperasi keliling", "pinjam uang tetangga berbunga"],
  },
  {
    slug: "gadai-sawah-adat",
    title: "Gadai sawah adat (pemberi utang menikmati panen)",
    category: "Pinjaman informal",
    status: "diperselisihkan",
    summary:
      "Dalam gadai syariah, barang jaminan tetap milik orang yang berutang. Jika pemberi utang menikmati hasil panen tanpa mengurangi utang, mayoritas ulama menilainya sebagai manfaat dari utang yang dilarang, namun sebagian membolehkan dengan izin pemilik.",
    reasons: [
      {
        term: "rahn (gadai)",
        text: "Gadai adalah menahan barang sebagai jaminan utang. Barang jaminan dan manfaatnya pada dasarnya tetap milik orang yang berutang.",
      },
      {
        term: "manfaat dari utang",
        text: "Hasil panen yang dinikmati pemberi utang tanpa mengurangi pokok utang dinilai sama dengan bunga oleh mayoritas ulama.",
      },
      {
        text: "Sebagian ulama membolehkan pemanfaatan barang gadai bila ada izin pemilik, atau bila ada biaya pemeliharaan yang ditanggung penerima gadai.",
      },
    ],
    references: [dsn("25/DSN-MUI/III/2002", 2002, "Rahn")],
    comparisons: [
      pembanding(
        "Pendapat fikih klasik",
        "Perbedaan mazhab tentang pemanfaatan barang gadai",
        "Jumhur ulama melarang penerima gadai memanfaatkan barang gadai; sebagian ulama Hanabilah membolehkan pemanfaatan sebatas biaya pemeliharaan untuk hewan tunggangan dan perahan.",
      ),
    ],
    conditions: [],
    alternatives: [
      {
        name: "Bagi hasil garapan (muzara'ah)",
        description: "Pemberi dana dan pemilik sawah berbagi hasil panen sesuai kesepakatan, terpisah dari utang.",
      },
      {
        name: "Sewa sawah (ijarah)",
        description: "Pemilik menyewakan sawah dengan harga sewa yang jelas, terpisah dari utang.",
      },
    ],
    keywords: ["gadai sawah", "gadai tanah", "sawah", "panen", "adat", "rahn sawah", "nyanda", "gadai kebun"],
    curatorNote: "Perlu rujukan Bahtsul Masail NU atau Majelis Tarjih yang membahas gadai sawah secara khusus.",
  },
  {
    slug: "gadai-emas-syariah",
    title: "Gadai emas di lembaga syariah",
    category: "Pembiayaan",
    status: "sesuai",
    summary:
      "Gadai emas di lembaga syariah dibolehkan menurut fatwa DSN-MUI, dengan biaya penyimpanan yang dihitung dari biaya riil, bukan dari besarnya pinjaman.",
    reasons: [
      {
        term: "rahn",
        text: "Emas ditahan sebagai jaminan atas pinjaman tanpa bunga (qardh).",
      },
      {
        term: "ijarah",
        text: "Lembaga boleh memungut ongkos penyimpanan dan pemeliharaan emas, dihitung berdasarkan pengeluaran yang nyata.",
      },
    ],
    references: [
      dsn("25/DSN-MUI/III/2002", 2002, "Rahn"),
      dsn("26/DSN-MUI/III/2002", 2002, "Rahn Emas"),
    ],
    comparisons: [],
    regulation: "Pegadaian syariah dan bank syariah diawasi OJK.",
    conditions: [
      "Ongkos penyimpanan tidak dihitung berdasarkan jumlah pinjaman.",
      "Emas tetap milik nasabah dan dikembalikan setelah utang lunas.",
    ],
    alternatives: [],
    keywords: ["gadai emas", "rahn emas", "pegadaian syariah", "gadai", "emas jaminan"],
  },
  {
    slug: "cicilan-emas-syariah",
    title: "Cicilan emas di lembaga syariah",
    category: "Investasi",
    status: "bersyarat",
    summary:
      "Membeli emas secara cicilan dibolehkan menurut fatwa DSN-MUI selama emas tidak menjadi alat tukar resmi dan harga yang disepakati tidak berubah selama masa cicilan.",
    reasons: [
      {
        text: "Fatwa DSN-MUI memandang emas saat ini sebagai barang (komoditas), bukan uang, sehingga boleh diperjualbelikan secara tidak tunai.",
      },
      {
        term: "gharar",
        text: "Harga harus pasti di awal. Jika harga bisa berubah selama cicilan, muncul ketidakjelasan yang dilarang.",
      },
    ],
    references: [dsn("77/DSN-MUI/V/2010", 2010, "Jual Beli Emas Secara Tidak Tunai")],
    comparisons: [
      pembanding(
        "Standar Syariah AAOIFI",
        "Standar Syariah No. 57 tentang emas dan ketentuan perdagangannya",
        "Lebih ketat: pada umumnya mensyaratkan serah terima emas secara tunai. Dirujuk dan diringkas, bukan disalin.",
      ),
    ],
    regulation: "Pastikan lembaga penyelenggara diawasi OJK.",
    conditions: [
      "Harga jual tidak berubah selama masa cicilan, meskipun harga emas pasar naik atau turun.",
      "Emas belum menjadi alat tukar resmi (uang).",
      "Emas yang dijadikan jaminan tidak boleh dijual atau dijadikan objek akad lain sebelum lunas.",
    ],
    alternatives: [],
    keywords: ["cicilan emas", "kredit emas", "beli emas cicil", "murabahah emas", "angsuran emas", "mulia"],
  },
  {
    slug: "tabungan-emas-digital",
    title: "Tabungan emas dan emas digital",
    category: "Investasi",
    status: "bersyarat",
    summary:
      "Tabungan emas dan emas digital dibolehkan bila emas fisiknya benar-benar ada, dimiliki penjual saat transaksi, dan dapat dicetak atau ditarik oleh pembeli.",
    reasons: [
      {
        term: "qabdh (serah terima)",
        text: "Emas yang dibeli harus benar-benar berpindah kepemilikan kepada pembeli, minimal tercatat atas nama pembeli dan bisa ditarik fisiknya.",
      },
      {
        term: "gharar",
        text: "Jika emas tidak ada wujudnya atau tidak bisa ditarik, pembeli hanya memegang angka di aplikasi. Ini menimbulkan ketidakjelasan.",
      },
    ],
    references: [dsn("77/DSN-MUI/V/2010", 2010, "Jual Beli Emas Secara Tidak Tunai")],
    comparisons: [
      pembanding(
        "Standar Syariah AAOIFI",
        "Standar Syariah No. 57 tentang emas dan ketentuan perdagangannya",
        "Mensyaratkan serah terima nyata atau setara (constructive possession) dalam jual beli emas. Dirujuk dan diringkas, bukan disalin.",
      ),
    ],
    regulation: "Cek izin penyelenggara di OJK (bank, pegadaian, atau usaha bulion) atau Bappebti.",
    conditions: [
      "Emas fisik tersedia dan disimpan oleh penyelenggara atau pihak kustodian.",
      "Emas tercatat atas nama pembeli dan dapat dicetak atau ditarik.",
      "Harga dan biaya penyimpanan jelas di awal.",
    ],
    alternatives: [],
    keywords: ["tabungan emas", "emas digital", "emas online", "nabung emas", "aplikasi emas", "emas di aplikasi"],
    curatorNote: "Cek apakah ada fatwa DSN-MUI yang lebih baru tentang emas digital atau kegiatan usaha bulion.",
  },
  {
    slug: "trading-forex-emas-leverage",
    title: "Trading emas dan forex dengan leverage (CFD)",
    category: "Trading",
    status: "tidak-sesuai",
    summary:
      "Trading forex dan emas dengan leverage atau kontrak CFD tidak memenuhi syarat jual beli mata uang dalam fatwa DSN-MUI, karena tidak ada serah terima tunai dan mengandung unsur spekulasi.",
    reasons: [
      {
        term: "sharf (tukar mata uang)",
        text: "Tukar mata uang harus tunai dan langsung serah terima. Pada CFD, trader tidak pernah memiliki mata uang atau emasnya, hanya bertaruh pada selisih harga.",
      },
      {
        term: "riba",
        text: "Leverage adalah dana pinjaman dari broker. Biaya inap posisi (swap atau rollover) berfungsi seperti bunga.",
      },
      {
        term: "maisir (spekulasi untung-untungan)",
        text: "Keuntungan satu pihak menjadi kerugian pihak lain tanpa ada pertukaran barang yang nyata.",
      },
    ],
    references: [dsn("28/DSN-MUI/III/2002", 2002, "Jual Beli Mata Uang (Al-Sharf)")],
    comparisons: [
      pembanding(
        "Majma' al-Fiqh al-Islami (OKI)",
        "Keputusan No. 63 (1/7) Tahun 1992 tentang pasar keuangan",
        "Transaksi margin dan opsi di pasar keuangan tidak dibolehkan.",
        { year: 1992 },
      ),
    ],
    regulation: "Pialang berjangka legal terdaftar di Bappebti. Legalitas tidak menentukan status syariah. Banyak broker forex luar negeri tidak berizin.",
    conditions: [],
    alternatives: [
      {
        name: "Membeli emas fisik atau tabungan emas syariah",
        description: "Kepemilikan emas yang nyata tanpa leverage.",
      },
      {
        name: "Tukar valas tunai untuk kebutuhan riil",
        description: "Penukaran mata uang secara langsung (spot) sesuai Fatwa DSN-MUI No. 28/DSN-MUI/III/2002.",
      },
    ],
    keywords: ["forex", "trading forex", "cfd", "leverage", "trading emas", "xauusd", "valas", "broker", "margin forex", "metatrader"],
  },
  {
    slug: "binary-option",
    title: "Binary option",
    category: "Trading",
    status: "tidak-sesuai",
    summary:
      "Binary option adalah taruhan naik atau turunnya harga dalam waktu singkat, sehingga termasuk judi (maisir) yang dilarang, dan di Indonesia juga bukan produk yang berizin.",
    reasons: [
      {
        term: "maisir (judi)",
        text: "Pengguna menebak arah harga dan kehilangan seluruh taruhan jika salah. Tidak ada barang yang dibeli atau dimiliki.",
      },
      {
        term: "gharar",
        text: "Hasilnya sepenuhnya bergantung pada kejadian yang tidak pasti dalam hitungan detik atau menit.",
      },
    ],
    references: [
      {
        institution: "Al-Qur'an",
        title: "QS Al-Ma'idah ayat 90 (larangan maisir)",
        verified: false,
      },
    ],
    comparisons: [],
    regulation: "Bappebti menyatakan binary option bukan produk perdagangan berjangka yang sah dan telah memblokir banyak platformnya. Beberapa afiliatornya diproses pidana.",
    conditions: [],
    alternatives: [
      {
        name: "Saham dan reksadana syariah",
        description: "Investasi pada aset riil yang terdaftar dan diawasi OJK.",
      },
    ],
    keywords: ["binary option", "opsi biner", "binomo", "olymptrade", "quotex", "iq option", "trading naik turun", "tebak harga"],
    curatorNote: "Belum ditemukan fatwa DSN-MUI atau MUI yang khusus membahas binary option. Perlu dicari rujukan resmi.",
  },
  {
    slug: "jual-beli-aset-kripto",
    title: "Jual beli aset kripto",
    category: "Aset digital",
    status: "diperselisihkan",
    summary:
      "MUI menyatakan kripto haram sebagai mata uang dan sebagai komoditas yang tidak memenuhi syarat, namun kripto yang punya aset dasar dan manfaat jelas dapat dinilai sah diperdagangkan. Lembaga lain di luar negeri memiliki pendapat berbeda.",
    reasons: [
      {
        term: "gharar",
        text: "Banyak aset kripto tidak memiliki aset dasar atau nilai pakai yang jelas, harganya sangat spekulatif.",
      },
      {
        term: "dharar (bahaya)",
        text: "Fluktuasi ekstrem dan maraknya penipuan dapat merugikan masyarakat.",
      },
      {
        text: "Sebagai komoditas, kripto yang memenuhi syarat sil'ah (barang dagangan), punya aset dasar, dan manfaat yang jelas dinilai sah diperdagangkan.",
      },
    ],
    references: [IJTIMA_VII],
    comparisons: [
      pembanding(
        "Bahtsul Masail NU",
        "Bahtsul Masail PWNU Jawa Timur 2021 tentang mata uang kripto",
        "Menilai transaksi kripto haram karena unsur gharar dan spekulasi.",
        { year: 2021 },
      ),
      pembanding(
        "Majelis Tarjih Muhammadiyah",
        "Fatwa Majelis Tarjih tentang cryptocurrency (2022)",
        "Kripto haram dijadikan alat investasi maupun alat tukar karena unsur spekulasi dan gharar.",
        { year: 2022 },
      ),
      pembanding(
        "Dar al-Ifta Mesir",
        "Fatwa tentang Bitcoin (2018)",
        "Melarang perdagangan Bitcoin karena risiko dan ketidakjelasan.",
        { year: 2018 },
      ),
      pembanding(
        "Shariah Advisory Council, Securities Commission Malaysia",
        "Resolusi tentang investasi aset digital (2020)",
        "Pada prinsipnya membolehkan investasi pada aset digital yang memenuhi kriteria syariah.",
        { year: 2020 },
      ),
    ],
    regulation: "Aset kripto legal sebagai aset yang diperdagangkan di pedagang berizin. Pengawasan beralih dari Bappebti ke OJK sejak Januari 2025. Kripto bukan alat pembayaran yang sah di Indonesia.",
    conditions: [],
    alternatives: [
      {
        name: "Saham dan reksadana syariah",
        description: "Investasi pada aset riil yang diawasi OJK dan dewan pengawas syariah.",
      },
      {
        name: "Emas fisik",
        description: "Komoditas dengan nilai pakai yang jelas.",
      },
    ],
    keywords: ["kripto", "crypto", "bitcoin", "btc", "ethereum", "koin", "token", "altcoin", "aset digital", "indodax", "tokocrypto"],
  },
  {
    slug: "saham-bank-konvensional",
    title: "Saham bank konvensional",
    category: "Pasar modal",
    status: "tidak-sesuai",
    summary:
      "Saham emiten yang usaha utamanya berbasis bunga, seperti bank konvensional, tidak termasuk efek syariah menurut fatwa DSN-MUI.",
    reasons: [
      {
        text: "Membeli saham berarti ikut memiliki perusahaan. Jika usaha utama perusahaan adalah menyalurkan pinjaman berbunga, pemegang saham ikut memiliki usaha riba.",
      },
      {
        text: "Fatwa DSN-MUI menyebut lembaga keuangan konvensional berbasis bunga sebagai salah satu jenis usaha yang bertentangan dengan prinsip syariah.",
      },
    ],
    references: [dsn("40/DSN-MUI/X/2003", 2003, "Pasar Modal dan Pedoman Umum Penerapan Prinsip Syariah di Bidang Pasar Modal")],
    comparisons: [
      pembanding(
        "Standar Syariah AAOIFI",
        "Standar Syariah No. 21 tentang efek (saham dan obligasi)",
        "Saham perusahaan yang kegiatan utamanya haram, seperti bank konvensional, tidak boleh dimiliki. Dirujuk dan diringkas, bukan disalin.",
      ),
    ],
    regulation: "Saham legal diperdagangkan di Bursa Efek Indonesia. Cek Daftar Efek Syariah (DES) yang diterbitkan OJK.",
    conditions: [],
    alternatives: [
      {
        name: "Saham dalam Daftar Efek Syariah",
        description: "Termasuk saham bank syariah dan emiten lain yang lolos penyaringan syariah.",
      },
      {
        name: "Reksadana saham syariah",
        description: "Portofolio saham syariah yang dikelola manajer investasi.",
      },
    ],
    keywords: ["saham bank", "saham bbca", "saham bbri", "saham bmri", "saham bank konvensional", "dividen bank"],
  },
  {
    slug: "saham-daftar-efek-syariah",
    title: "Saham dalam Daftar Efek Syariah",
    category: "Pasar modal",
    status: "bersyarat",
    summary:
      "Saham yang masuk Daftar Efek Syariah boleh dibeli, dengan syarat transaksinya juga syariah: tanpa margin berbunga, tanpa short selling, dan tanpa transaksi semu.",
    reasons: [
      {
        text: "OJK menyaring saham berdasarkan jenis usaha dan rasio keuangan: utang berbasis bunga tidak lebih dari 45% aset, dan pendapatan tidak halal tidak lebih dari 10% total pendapatan.",
      },
      {
        text: "Lolos penyaringan berarti sahamnya syariah, namun cara transaksinya juga harus sesuai syariah.",
      },
    ],
    references: [
      dsn("40/DSN-MUI/X/2003", 2003, "Pasar Modal dan Pedoman Umum Penerapan Prinsip Syariah di Bidang Pasar Modal"),
      dsn("80/DSN-MUI/III/2011", 2011, "Penerapan Prinsip Syariah dalam Mekanisme Perdagangan Efek Bersifat Ekuitas di Pasar Reguler Bursa Efek"),
      {
        institution: "OJK",
        number: "POJK No. 35/POJK.04/2017",
        year: 2017,
        title: "Kriteria dan Penerbitan Daftar Efek Syariah",
        url: OJK_URL,
        verified: false,
      },
    ],
    comparisons: [
      pembanding(
        "Standar Syariah AAOIFI",
        "Standar Syariah No. 21 tentang efek (saham dan obligasi)",
        "Memakai ambang rasio utang berbunga yang lebih ketat (umumnya 30%). Dirujuk dan diringkas, bukan disalin.",
      ),
    ],
    regulation: "DES diperbarui OJK secara berkala (periodik dan insidentil). Cek status saham pada DES terbaru.",
    conditions: [
      "Saham tercantum dalam Daftar Efek Syariah terbaru.",
      "Membeli lewat rekening efek syariah (Sharia Online Trading System) atau tanpa fasilitas margin berbunga.",
      "Tidak melakukan short selling, transaksi semu, atau menggoreng harga (bai' najsy).",
    ],
    alternatives: [],
    keywords: ["saham syariah", "daftar efek syariah", "des", "issi", "jii", "rekening efek syariah", "sots", "investasi saham"],
  },
  {
    slug: "margin-trading-short-selling",
    title: "Margin trading dan short selling",
    category: "Pasar modal",
    status: "tidak-sesuai",
    summary:
      "Membeli saham dengan pinjaman berbunga (margin) atau menjual saham yang belum dimiliki (short selling) termasuk transaksi yang dilarang dalam fatwa DSN-MUI tentang perdagangan efek.",
    reasons: [
      {
        term: "riba",
        text: "Margin trading konvensional berarti meminjam dana broker dengan bunga untuk membeli saham.",
      },
      {
        term: "bai' al-ma'dum (menjual yang tidak dimiliki)",
        text: "Short selling adalah menjual saham pinjaman yang belum dimiliki, dengan harapan membelinya kembali lebih murah.",
      },
    ],
    references: [dsn("80/DSN-MUI/III/2011", 2011, "Penerapan Prinsip Syariah dalam Mekanisme Perdagangan Efek Bersifat Ekuitas di Pasar Reguler Bursa Efek")],
    comparisons: [
      pembanding(
        "Majma' al-Fiqh al-Islami (OKI)",
        "Keputusan No. 63 (1/7) Tahun 1992 tentang pasar keuangan",
        "Jual beli dengan margin berbunga dan short selling tidak dibolehkan.",
        { year: 1992 },
      ),
    ],
    regulation: "Margin dan short selling legal pada saham tertentu yang ditetapkan bursa.",
    conditions: [],
    alternatives: [
      {
        name: "Beli saham syariah dengan dana sendiri",
        description: "Transaksi tunai lewat rekening efek syariah.",
      },
    ],
    keywords: ["margin", "margin trading", "short selling", "short sell", "jual kosong", "pinjam saham", "leverage saham"],
    curatorNote: "Cek apakah ada fatwa DSN-MUI yang lebih baru tentang pembiayaan transaksi efek berbasis syariah.",
  },
  {
    slug: "reksadana-konvensional",
    title: "Reksadana konvensional",
    category: "Investasi",
    status: "tidak-sesuai",
    summary:
      "Reksadana konvensional boleh menempatkan dana pada instrumen berbunga dan saham yang tidak lolos penyaringan syariah, sehingga tidak memenuhi pedoman reksadana syariah DSN-MUI.",
    reasons: [
      {
        term: "riba",
        text: "Reksadana pasar uang dan pendapatan tetap konvensional berisi deposito dan obligasi berbunga.",
      },
      {
        text: "Reksadana saham konvensional dapat memuat saham bank konvensional atau usaha lain yang tidak sesuai syariah, tanpa pembersihan pendapatan.",
      },
    ],
    references: [dsn("20/DSN-MUI/IV/2001", 2001, "Pedoman Pelaksanaan Investasi untuk Reksa Dana Syariah (sebagai pembanding)")],
    comparisons: [],
    regulation: "Reksadana konvensional legal dan diawasi OJK.",
    conditions: [],
    alternatives: [
      {
        name: "Reksadana syariah",
        description: "Reksadana yang portofolionya hanya berisi efek syariah dan diawasi dewan pengawas syariah.",
      },
    ],
    keywords: ["reksadana", "reksa dana", "reksadana pasar uang", "reksadana konvensional", "obligasi", "reksadana pendapatan tetap"],
  },
  {
    slug: "reksadana-syariah",
    title: "Reksadana syariah",
    category: "Investasi",
    status: "sesuai",
    summary:
      "Reksadana syariah yang dikelola sesuai pedoman DSN-MUI dan diawasi dewan pengawas syariah termasuk investasi yang sesuai syariah.",
    reasons: [
      {
        text: "Dana hanya ditempatkan pada efek syariah seperti saham dalam DES, sukuk, dan deposito bank syariah.",
      },
      {
        text: "Pendapatan yang tidak halal dari porsi kecil yang tak terhindarkan dipisahkan dan disalurkan untuk kepentingan sosial (cleansing).",
      },
    ],
    references: [
      dsn("20/DSN-MUI/IV/2001", 2001, "Pedoman Pelaksanaan Investasi untuk Reksa Dana Syariah"),
      {
        institution: "OJK",
        number: "POJK No. 33/POJK.04/2019",
        year: 2019,
        title: "Penerbitan dan Persyaratan Reksa Dana Syariah",
        url: OJK_URL,
        verified: false,
      },
    ],
    comparisons: [],
    regulation: "Cek bahwa produk terdaftar di OJK dan manajer investasinya berizin.",
    conditions: [],
    alternatives: [],
    keywords: ["reksadana syariah", "reksa dana syariah", "sukuk", "investasi syariah", "reksadana pasar uang syariah"],
  },
  {
    slug: "asuransi-konvensional",
    title: "Asuransi konvensional",
    category: "Asuransi",
    status: "tidak-sesuai",
    summary:
      "Asuransi konvensional dinilai mengandung ketidakjelasan, untung-untungan, dan riba, sehingga DSN-MUI menyusun pedoman asuransi syariah berbasis tolong-menolong sebagai gantinya.",
    reasons: [
      {
        term: "gharar",
        text: "Premi dibayar untuk pertanggungan yang belum pasti terjadi, dan premi menjadi milik perusahaan.",
      },
      {
        term: "maisir",
        text: "Satu pihak bisa untung besar dan pihak lain rugi tergantung terjadinya risiko.",
      },
      {
        term: "riba",
        text: "Dana premi umumnya diinvestasikan pada instrumen berbunga.",
      },
    ],
    references: [dsn("21/DSN-MUI/X/2001", 2001, "Pedoman Umum Asuransi Syariah")],
    comparisons: [
      pembanding(
        "Majma' al-Fiqh al-Islami (OKI)",
        "Keputusan No. 9 (9/2) Tahun 1985 tentang asuransi",
        "Asuransi komersial dengan premi tetap tidak dibolehkan; asuransi berbasis tolong-menolong (ta'awuni) dibolehkan.",
        { year: 1985 },
      ),
      pembanding(
        "Standar Syariah AAOIFI",
        "Standar Syariah No. 26 tentang asuransi syariah",
        "Dirujuk sebagai standar industri; isi diringkas, bukan disalin.",
      ),
    ],
    regulation: "Perusahaan asuransi diawasi OJK. Asuransi wajib dari pemberi kerja atau undang-undang dapat dibahas terpisah dengan ahli.",
    conditions: [],
    alternatives: [
      {
        name: "Asuransi syariah (takaful)",
        description: "Peserta saling menanggung lewat dana tabarru'; perusahaan sebagai pengelola dengan akad wakalah bil ujrah (Fatwa DSN-MUI No. 52/DSN-MUI/III/2006).",
      },
    ],
    keywords: ["asuransi", "asuransi jiwa", "asuransi kesehatan", "unit link", "premi", "polis", "asuransi mobil"],
  },
  {
    slug: "bpjs-kesehatan",
    title: "BPJS Kesehatan",
    category: "Asuransi",
    status: "diperselisihkan",
    summary:
      "Ijtima Ulama MUI 2015 menilai penyelenggaraan BPJS Kesehatan saat itu belum sesuai syariah dan merekomendasikan skema syariah, namun MUI kemudian menegaskan tidak mengharamkan kepesertaan dan BPJS tetap wajib menurut undang-undang.",
    reasons: [
      {
        term: "gharar, maisir, riba",
        text: "Ijtima Ulama menyoroti akad yang belum jelas, denda keterlambatan, dan penempatan dana pada instrumen berbunga.",
      },
      {
        text: "Kepesertaan BPJS diwajibkan negara dan berfungsi sebagai jaminan sosial, sehingga banyak ulama memandang peserta tidak berdosa ikut serta.",
      },
    ],
    references: [
      mui(undefined, 2015, "Keputusan Ijtima Ulama Komisi Fatwa se-Indonesia V tentang BPJS Kesehatan"),
      dsn("98/DSN-MUI/XII/2015", 2015, "Pedoman Penyelenggaraan Jaminan Sosial Kesehatan Syariah"),
    ],
    comparisons: [],
    regulation: "Kepesertaan BPJS Kesehatan wajib bagi seluruh penduduk berdasarkan UU No. 24 Tahun 2011 tentang BPJS.",
    conditions: [],
    alternatives: [
      {
        name: "Tetap ikut BPJS sambil mendorong skema syariah",
        description: "Fatwa DSN-MUI No. 98/DSN-MUI/XII/2015 sudah menyediakan pedoman jaminan kesehatan syariah.",
      },
      {
        name: "Asuransi kesehatan syariah tambahan",
        description: "Untuk perlindungan di luar cakupan BPJS.",
      },
    ],
    keywords: ["bpjs", "bpjs kesehatan", "jkn", "kis", "jaminan kesehatan", "iuran bpjs", "denda bpjs"],
  },
  {
    slug: "arisan-biasa",
    title: "Arisan biasa (setoran dan giliran sama)",
    category: "Sosial",
    status: "sesuai",
    summary:
      "Arisan dengan setoran yang sama dan setiap anggota menerima jumlah yang sama sesuai giliran dipandang sebagai utang-piutang bergilir yang dibolehkan.",
    reasons: [
      {
        term: "qardh (utang kebajikan)",
        text: "Anggota yang dapat giliran awal pada dasarnya berutang ke anggota lain, lalu melunasinya lewat setoran berikutnya. Tidak ada tambahan bagi siapa pun.",
      },
      {
        text: "Masalah muncul jika ada potongan untuk pengelola yang tidak jelas, lelang giliran dengan potongan, atau setoran yang tidak sama.",
      },
    ],
    references: [dsn("19/DSN-MUI/IV/2001", 2001, "Al-Qardh (analogi, perlu konfirmasi dewan pengawas)")],
    comparisons: [],
    conditions: [],
    alternatives: [],
    keywords: ["arisan", "arisan ibu-ibu", "kocok arisan", "arisan rt", "arisan keluarga", "arisan kantor"],
    curatorNote: "Belum ada fatwa DSN-MUI atau MUI yang khusus membahas arisan. Rujukan saat ini adalah analogi kurator ke akad qardh dan perlu dicari rujukan resmi.",
  },
  {
    slug: "arisan-berantai-investasi-berlipat",
    title: "Arisan berantai dan investasi berlipat",
    category: "Skema berisiko",
    status: "tidak-sesuai",
    summary:
      "Arisan berantai, arisan online dengan imbal hasil berlipat, dan investasi yang menjanjikan untung pasti tinggi umumnya adalah skema piramida atau money game yang dilarang.",
    reasons: [
      {
        term: "money game",
        text: "Keuntungan anggota lama dibayar dari setoran anggota baru, bukan dari usaha yang nyata. Skema pasti runtuh saat anggota baru berhenti masuk.",
      },
      {
        term: "gharar dan maisir",
        text: "Anggota terakhir hampir selalu rugi, sementara perekrut awal untung.",
      },
      {
        term: "riba",
        text: "Arisan dengan setoran kecil yang dibayar kembali lebih besar (misal arisan menurun atau arisan dengan bunga) mengandung tambahan atas utang.",
      },
    ],
    references: [dsn("75/DSN-MUI/VII/2009", 2009, "Pedoman Penjualan Langsung Berjenjang Syariah (PLBS)")],
    comparisons: [],
    regulation: "Banyak skema ini ilegal. Cek di daftar Satgas PASTI (OJK) dan laporkan bila mencurigakan.",
    conditions: [],
    alternatives: [
      {
        name: "Arisan biasa dengan setoran dan giliran sama",
        description: "Tanpa potongan, lelang, atau janji imbal hasil.",
      },
      {
        name: "Reksadana syariah",
        description: "Investasi yang diawasi OJK dengan risiko yang dijelaskan secara terbuka.",
      },
    ],
    keywords: ["arisan berantai", "arisan online", "arisan menurun", "investasi bodong", "money game", "skema ponzi", "piramida", "investasi berlipat", "untung pasti"],
  },
  {
    slug: "mlm-berbasis-rekrutmen",
    title: "MLM berbasis rekrutmen",
    category: "Skema berisiko",
    status: "tidak-sesuai",
    summary:
      "MLM yang bonusnya terutama dari merekrut anggota baru, bukan dari penjualan produk riil, tidak memenuhi pedoman penjualan langsung berjenjang syariah DSN-MUI.",
    reasons: [
      {
        term: "money game",
        text: "Jika produk hanya formalitas dan keuntungan datang dari uang pendaftaran anggota baru, skemanya sama dengan piramida.",
      },
      {
        term: "ighra' (iming-iming berlebihan)",
        text: "Janji bonus besar yang tidak sebanding dengan usaha menarik orang ikut tanpa memahami risikonya.",
      },
    ],
    references: [dsn("75/DSN-MUI/VII/2009", 2009, "Pedoman Penjualan Langsung Berjenjang Syariah (PLBS)")],
    comparisons: [],
    regulation: "Perusahaan penjualan langsung wajib memiliki izin usaha penjualan langsung dari Kementerian Perdagangan.",
    conditions: [],
    alternatives: [
      {
        name: "Perusahaan PLBS bersertifikat DSN-MUI",
        description: "Penjualan langsung berjenjang yang lolos sertifikasi syariah, dengan bonus dari penjualan produk riil.",
      },
    ],
    keywords: ["mlm", "multi level marketing", "network marketing", "downline", "upline", "rekrut member", "bisnis jaringan"],
  },
  {
    slug: "undian-berbayar-judi-online",
    title: "Undian berbayar dan judi online",
    category: "Judi",
    status: "tidak-sesuai",
    summary:
      "Judi online, slot, dan undian yang mensyaratkan peserta membayar untuk peluang menang hadiah termasuk judi (maisir) yang tegas dilarang dalam Al-Qur'an.",
    reasons: [
      {
        term: "maisir (judi)",
        text: "Peserta menyetor uang, lalu hadiah ditentukan oleh untung-untungan. Uang yang kalah menjadi hadiah bagi yang menang dan keuntungan bandar.",
      },
      {
        text: "Undian promosi gratis tanpa biaya tambahan dari peserta berbeda hukumnya dan perlu dilihat kasus per kasus.",
      },
    ],
    references: [
      {
        institution: "Al-Qur'an",
        title: "QS Al-Ma'idah ayat 90 sampai 91 (larangan maisir)",
        verified: false,
      },
    ],
    comparisons: [],
    regulation: "Perjudian adalah tindak pidana di Indonesia, termasuk judi online menurut UU ITE.",
    conditions: [],
    alternatives: [
      {
        name: "Layanan konseling dan pemulihan kecanduan judi",
        description: "Hubungi tenaga kesehatan jiwa atau lembaga pendampingan bila sulit berhenti.",
      },
    ],
    keywords: ["judi", "judi online", "judol", "slot", "slot online", "togel", "undian berbayar", "taruhan", "kasino", "gacor"],
    curatorNote: "Perlu dilengkapi fatwa MUI terkait judi dan undian berhadiah.",
  },
];
