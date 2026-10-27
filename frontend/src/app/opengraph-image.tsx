import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Herbal Kapıda — Büşra Özberk, Bağımsız Distribütör";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "#000000",
          color: "#186028",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -1 }}>
              Herbalife
            </div>
            <svg width="48" height="48" viewBox="0 0 64 64" style={{ marginTop: 4 }}>
              <path
                d="M18 46c2-14 10-26 22-34 1 12-2 24-10 34-4 2-8 2-12 0z"
                fill="#186028"
              />
              <path
                d="M28 48c4-16 14-28 28-34-2 14-8 26-18 34-4 1-7 1-10 0z"
                fill="#1f7a34"
              />
              <path
                d="M34 50c6-12 14-20 24-24-4 12-12 22-22 28-1-1-2-2-2-4z"
                fill="#24963e"
              />
            </svg>
          </div>
          <div
            style={{
              width: 2,
              height: 72,
              background: "#186028",
              marginLeft: 8,
              marginRight: 8,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 28,
              fontWeight: 500,
              lineHeight: 1.25,
            }}
          >
            <span>Bağımsız</span>
            <span>Distribütör</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 48,
            fontSize: 44,
            fontWeight: 700,
            color: "#1f7a34",
          }}
        >
          Büşra Özberk · +90 505 142 07 10
        </div>
        <div style={{ marginTop: 16, fontSize: 28, color: "#186028" }}>
          Adatepe Mah. 73 Sk. No: 3 D: 9 · Buca / İZMİR
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#24963e",
          }}
        >
          herbalkapida.com
        </div>
      </div>
    ),
    size,
  );
}
