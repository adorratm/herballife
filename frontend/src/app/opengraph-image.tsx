import { ImageResponse } from "next/og";
import { getSiteSettings } from "@/lib/cms";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Herbal Kapıda — Bağımsız Distribütör";
export const revalidate = 300;

export default async function OpenGraphImage() {
  const settings = await getSiteSettings("tr");
  const name =
    settings.brand.distributorName?.trim() || settings.brand.name || "Herbal Kapıda";
  const phone = settings.contact.phone?.trim() || "";
  const address = settings.contact.address?.trim() || "";
  const location =
    settings.contact.locationLabel?.trim() || settings.brand.location?.trim() || "";
  const line2 = [address, location].filter(Boolean).join(" · ");
  const headline = phone ? `${name} · ${phone}` : name;

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
          background: "#ffffff",
          color: "#157a4c",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -1 }}>
              {settings.brand.name || "Herbal Kapıda"}
            </div>
          </div>
          <div
            style={{
              width: 2,
              height: 72,
              background: "#157a4c",
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
            <span>{settings.brand.distributorTitle || "Bağımsız Distribütör"}</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 48,
            fontSize: 40,
            fontWeight: 700,
            color: "#0f5c38",
          }}
        >
          {headline}
        </div>
        {line2 ? (
          <div style={{ marginTop: 16, fontSize: 26, color: "#157a4c" }}>
            {line2}
          </div>
        ) : null}
        <div
          style={{
            marginTop: 36,
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#1f7a34",
          }}
        >
          herbalkapida.com
        </div>
      </div>
    ),
    size,
  );
}
