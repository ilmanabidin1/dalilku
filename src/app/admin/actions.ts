"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, requireSession, startSession } from "@/lib/auth";
import { contentFromForm, FormError } from "@/lib/card-form";
import {
  createCard,
  setQueueState,
  transitionCard,
  unpublishCard,
  updateCardContent,
  WorkflowError,
} from "@/lib/store";
import type { QueueState } from "@/lib/types";

function withMessage(path: string, key: "error" | "ok", message: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}${key}=${encodeURIComponent(message)}`;
}

function knownError(err: unknown): string | null {
  return err instanceof FormError || err instanceof WorkflowError ? err.message : null;
}

function revalidatePublic() {
  revalidatePath("/", "layout");
}

export async function loginAction(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  const role = form.get("role") === "pengawas" ? "pengawas" : "kurator";
  const password = String(form.get("password") ?? "");
  if (name.length < 3) redirect(withMessage("/admin/masuk", "error", "Nama wajib diisi (tercatat di riwayat versi)"));
  if (!checkPassword(role, password)) redirect(withMessage("/admin/masuk", "error", "Kata sandi salah"));
  await startSession(name, role);
  redirect("/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/masuk");
}

export async function createCardAction(form: FormData) {
  const session = await requireSession();
  let id: string;
  try {
    id = (await createCard(contentFromForm(form), session.name)).id;
  } catch (err) {
    const msg = knownError(err);
    if (!msg) throw err;
    redirect(withMessage("/admin/kartu/baru", "error", msg));
  }
  redirect(withMessage(`/admin/kartu/${id}`, "ok", "Draf kartu dibuat"));
}

export async function saveCardAction(id: string, form: FormData) {
  const session = await requireSession();
  const note = String(form.get("changeNote") ?? "").trim() || undefined;
  try {
    await updateCardContent(id, contentFromForm(form), session.name, session.role, note);
  } catch (err) {
    const msg = knownError(err);
    if (!msg) throw err;
    redirect(withMessage(`/admin/kartu/${id}`, "error", msg));
  }
  revalidatePublic();
  redirect(withMessage(`/admin/kartu/${id}`, "ok", "Perubahan disimpan sebagai draf baru"));
}

export async function transitionAction(id: string, form: FormData) {
  const session = await requireSession();
  const action = String(form.get("action") ?? "");
  const note = String(form.get("note") ?? "");
  try {
    await transitionCard(id, action, session.name, session.role, note);
  } catch (err) {
    const msg = knownError(err);
    if (!msg) throw err;
    redirect(withMessage(`/admin/kartu/${id}`, "error", msg));
  }
  revalidatePublic();
  redirect(withMessage(`/admin/kartu/${id}`, "ok", "Status kartu diperbarui"));
}

export async function unpublishAction(id: string, form: FormData) {
  const session = await requireSession();
  if (session.role !== "pengawas") redirect(withMessage(`/admin/kartu/${id}`, "error", "Hanya dewan pengawas"));
  try {
    await unpublishCard(id, session.name, String(form.get("note") ?? ""));
  } catch (err) {
    const msg = knownError(err);
    if (!msg) throw err;
    redirect(withMessage(`/admin/kartu/${id}`, "error", msg));
  }
  revalidatePublic();
  redirect(withMessage(`/admin/kartu/${id}`, "ok", "Kartu ditarik dari tayangan publik"));
}

export async function queueAction(id: string, form: FormData) {
  await requireSession();
  const state = String(form.get("state") ?? "") as QueueState;
  if (!["baru", "diproses", "selesai", "ditolak"].includes(state)) redirect("/admin/antrean");
  await setQueueState(id, state, String(form.get("note") ?? ""));
  revalidatePath("/admin/antrean");
  redirect("/admin/antrean");
}
