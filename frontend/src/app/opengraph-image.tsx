import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 64,
          background: "linear-gradient(145deg, #0f2f22 0%, #157a4c 55%, #e6f4ed 100%)",
          color: "#ffffff",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#dff3e8", textTransform: "uppercase" }}>
          Bağımsız Distribütör
        </div>
        <div style={{ fontSize: 72, lineHeight: 1.05, marginTop: 16, fontWeight: 700 }}>
          Herbalife
        </div>
        <div style={{ fontSize: 28, marginTop: 20, color: "#eaf3ee", maxWidth: 800 }}>
          Doğal ürünler, kişisel koçluk.
        </div>
      </div>
    ),
    size,
  );
}
