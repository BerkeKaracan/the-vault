import { ImageResponse } from "next/og";

const MARK = {
  background: "#09090b",
  color: "#4ade80",
} as const;

export function brandMarkPng(size: number) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: MARK.background,
        color: MARK.color,
        fontSize: Math.round(size * 0.55),
        fontWeight: 700,
        letterSpacing: "-0.08em",
        fontFamily: "Syne, sans-serif",
      }}
    >
      V
    </div>,
    { width: size, height: size },
  );
}
