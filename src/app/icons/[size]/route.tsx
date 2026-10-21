import { ImageResponse } from "next/og";

const SIZES = new Set([192, 512]);

export function generateStaticParams() {
  return [...SIZES].map((size) => ({ size: String(size) }));
}

export async function GET(_req: Request, { params }: RouteContext<"/icons/[size]">) {
  const size = Number((await params).size);
  if (!SIZES.has(size)) return new Response("Not found", { status: 404 });
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f6b4f",
          color: "#ffffff",
          fontSize: size * 0.55,
          fontWeight: 700,
        }}
      >
        D
      </div>
    ),
    { width: size, height: size },
  );
}
