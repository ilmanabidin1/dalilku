import { CardForm } from "@/components/admin/CardForm";
import { createCardAction } from "../../../actions";

export default async function NewCardPage({ searchParams }: PageProps<"/admin/kartu/baru">) {
  const { error } = await searchParams;
  return (
    <div className="stack">
      <h1>Kartu baru</h1>
      {typeof error === "string" ? <p className="notice notice-error">{error}</p> : null}
      <CardForm action={createCardAction} submitLabel="Simpan sebagai draf" />
    </div>
  );
}
