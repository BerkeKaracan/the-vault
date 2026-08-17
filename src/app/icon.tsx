import { brandMarkPng } from "@/lib/brand-mark";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return brandMarkPng(512);
}
