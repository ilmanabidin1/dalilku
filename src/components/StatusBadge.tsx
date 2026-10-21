import { STATUS_INFO, type Status } from "@/lib/types";

export function StatusBadge({ status }: { status: Status }) {
  const info = STATUS_INFO[status];
  return <span className={`badge badge-${info.color}`}>{info.label}</span>;
}

export function DraftBadge() {
  return <span className="badge badge-draf">Draf, belum divalidasi</span>;
}
