import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          borderRadius: 36,
        }}
      >
        <svg width="110" height="110" viewBox="0 0 64 64">
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
    ),
    size,
  );
}
