import { FORMAT_HINTS, formValues } from "@/lib/card-form";
import { CATEGORIES, STATUSES, STATUS_INFO, type CardContent } from "@/lib/types";

const EMPTY: CardContent = {
  slug: "",
  title: "",
  category: "Perbankan",
  status: "tidak-sesuai",
  summary: "",
  reasons: [],
  references: [],
  comparisons: [],
  conditions: [],
  alternatives: [],
  keywords: [],
};

function Area({ name, label, hint, value, rows = 4 }: { name: string; label: string; hint?: string; value: string; rows?: number }) {
  return (
    <div className="field">
      <label htmlFor={name}>
        {label}
        {hint ? <span className="hint"> {hint}</span> : null}
      </label>
      <textarea id={name} name={name} defaultValue={value} rows={rows} />
    </div>
  );
}

export function CardForm({
  content,
  action,
  submitLabel,
  showChangeNote = false,
}: {
  content?: CardContent;
  action: (form: FormData) => Promise<void>;
  submitLabel: string;
  showChangeNote?: boolean;
}) {
  const v = formValues(content ?? EMPTY);
  return (
    <form action={action} className="card">
      <div className="grid-2">
        <div className="field">
          <label htmlFor="title">1. Nama transaksi</label>
          <input id="title" name="title" type="text" defaultValue={v.title} required />
        </div>
        <div className="field">
          <label htmlFor="slug">
            Slug alamat <span className="hint">/t/slug</span>
          </label>
          <input id="slug" name="slug" type="text" defaultValue={v.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" />
        </div>
        <div className="field">
          <label htmlFor="category">Kategori</label>
          <select id="category" name="category" defaultValue={v.category}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={v.status}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_INFO[s].label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Area name="summary" label="2. Ringkasan satu kalimat (bahasa awam)" value={v.summary} rows={3} />
      <Area name="reasons" label="3. Alasan" hint={FORMAT_HINTS.reasons} value={v.reasons} rows={5} />
      <Area name="references" label="4. Rujukan Indonesia" hint={FORMAT_HINTS.references} value={v.references} />
      <Area name="comparisons" label="5. Rujukan pembanding" hint={FORMAT_HINTS.comparisons} value={v.comparisons} />
      <Area name="regulation" label="6. Status regulasi" value={v.regulation} rows={2} />
      <Area name="conditions" label="7. Syarat" hint={FORMAT_HINTS.conditions} value={v.conditions} rows={3} />
      <Area name="alternatives" label="8. Alternatif syariah" hint={FORMAT_HINTS.alternatives} value={v.alternatives} />
      <Area name="keywords" label="Kata kunci pencarian" hint={FORMAT_HINTS.keywords} value={v.keywords} rows={2} />
      <Area
        name="curatorNote"
        label="Catatan kurator untuk dewan pengawas"
        hint="Tidak tampil ke publik."
        value={v.curatorNote}
        rows={2}
      />
      {showChangeNote ? (
        <div className="field">
          <label htmlFor="changeNote">Catatan perubahan</label>
          <input id="changeNote" name="changeNote" type="text" placeholder="Misal: memperbaiki nomor fatwa sesuai dokumen" />
        </div>
      ) : null}
      <p className="small muted">Penafian (bagian 9) ditambahkan otomatis di setiap kartu.</p>
      <button className="btn btn-primary">{submitLabel}</button>
    </form>
  );
}
