import { brandMarkPng } from "@/lib/brand-mark";

export function generateImageMetadata() {
  return [
    {
      contentType: "image/png",
      size: { width: 192, height: 192 },
      id: "192",
    },
    {
      contentType: "image/png",
      size: { width: 512, height: 512 },
      id: "512",
    },
  ];
}

export default function Icon({ id }: { id: string }) {
  return brandMarkPng(id === "192" ? 192 : 512);
}
