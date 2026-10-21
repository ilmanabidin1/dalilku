import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "./types";

export const SESSION_COOKIE = "dalilku_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12;
const DEV_PASSWORDS: Record<"kurator" | "pengawas", string> = {
  kurator: "kurator",
  pengawas: "pengawas",
};

export interface Session {
  name: string;
  role: Exclude<Role, "sistem">;
  exp: number;
}

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("ADMIN_SESSION_SECRET wajib diisi di produksi");
  return "dalilku-dev-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function passwordFor(role: Session["role"]): string | null {
  const env = role === "kurator" ? process.env.ADMIN_PASSWORD_KURATOR : process.env.ADMIN_PASSWORD_PENGAWAS;
  if (env) return env;
  return process.env.NODE_ENV === "production" ? null : DEV_PASSWORDS[role];
}

export function checkPassword(role: Session["role"], password: string): boolean {
  const expected = passwordFor(role);
  return expected !== null && safeEqual(password, expected);
}

export function encodeSession(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined): Session | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    if (session.exp < Date.now() / 1000) return null;
    if (session.role !== "kurator" && session.role !== "pengawas") return null;
    return session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  return decodeSession((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/admin/masuk");
  return session;
}

export async function startSession(name: string, role: Session["role"]) {
  const session: Session = { name, role, exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS };
  (await cookies()).set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
