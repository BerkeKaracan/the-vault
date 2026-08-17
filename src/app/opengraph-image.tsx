import { ImageResponse } from "next/og";
import { defaultLocale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";

export const alt = "The Vault";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const dictionary = dictionaries[defaultLocale];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#09090b",
        color: "#fafafa",
        padding: "72px 80px",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 22,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "#4ade80",
        }}
      >
        {dictionary.brand}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
          }}
        >
          {dictionary.landing.headlineLine1}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: "#a1a1aa",
          }}
        >
          {dictionary.landing.headlineLine2}
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 28, color: "#71717a" }}>
        {dictionary.meta.description}
      </div>
    </div>,
    { ...size },
  );
}
