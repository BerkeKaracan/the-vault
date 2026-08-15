import { cache } from "react";
import type { Locale } from "@/i18n/config";
import { cleanBookDescription } from "@/lib/text";

const TR_CHARS = /[ğıüşöçİĞÜŞÖÇ]/;

export function detectDescriptionLocale(text: string): Locale {
  return TR_CHARS.test(text) ? "tr" : "en";
}

function splitForLimit(text: string, max: number): string[] {
  if (text.length <= max) return [text];

  const parts: string[] = [];
  for (const para of text.split("\n\n")) {
    if (para.length <= max) {
      parts.push(para);
      continue;
    }
    let rest = para;
    while (rest.length > max) {
      const slice = rest.slice(0, max);
      const breakAt = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf(" "));
      const at = breakAt > 40 ? breakAt + 1 : max;
      parts.push(rest.slice(0, at).trim());
      rest = rest.slice(at).trim();
    }
    if (rest) parts.push(rest);
  }
  return parts.filter(Boolean);
}

async function translateGoogle(
  texts: string[],
  source: Locale,
  target: Locale,
  apiKey: string,
): Promise<string[] | null> {
  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: texts,
        source,
        target,
        format: "text",
      }),
    },
  );

  if (!res.ok) return null;

  const data = (await res.json()) as {
    data?: { translations?: { translatedText?: string }[] };
  };
  const translations = data.data?.translations;
  if (!translations || translations.length !== texts.length) return null;

  return translations.map((item) => item.translatedText ?? "");
}

async function translateMyMemory(
  text: string,
  source: Locale,
  target: Locale,
): Promise<string | null> {
  const params = new URLSearchParams({
    q: text,
    langpair: `${source}|${target}`,
  });
  const res = await fetch(
    `https://api.mymemory.translated.net/get?${params.toString()}`,
    {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 * 60 * 24 * 7 },
    },
  );
  if (!res.ok) return null;

  const data = (await res.json()) as {
    responseData?: { translatedText?: string };
    responseStatus?: number;
  };
  if (data.responseStatus !== 200) return null;
  const translated = data.responseData?.translatedText?.trim();
  if (!translated || /MYMEMORY WARNING/i.test(translated)) return null;
  return translated;
}

async function translateText(
  text: string,
  source: Locale,
  target: Locale,
): Promise<string> {
  const paragraphs = text.split("\n\n");
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY?.trim();

  if (apiKey) {
    const google = await translateGoogle(paragraphs, source, target, apiKey);
    if (google) {
      return google.map((part) => cleanBookDescription(part)).join("\n\n");
    }
  }

  const chunks = splitForLimit(text, 450);
  const translated: string[] = [];
  for (const chunk of chunks) {
    const next = await translateMyMemory(chunk, source, target);
    translated.push(next ?? chunk);
  }
  return cleanBookDescription(translated.join("\n\n"));
}

export const localizeDescription = cache(
  async (
    text: string | null | undefined,
    locale: Locale,
  ): Promise<string | null> => {
    if (!text) return null;
    const cleaned = cleanBookDescription(text);
    if (!cleaned) return null;
    if (detectDescriptionLocale(cleaned) === locale) return cleaned;

    try {
      return await translateText(
        cleaned,
        detectDescriptionLocale(cleaned),
        locale,
      );
    } catch {
      return cleaned;
    }
  },
);
