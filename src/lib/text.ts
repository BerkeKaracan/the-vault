const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  rsquo: "\u2019",
  lsquo: "\u2018",
  rdquo: "\u201D",
  ldquo: "\u201C",
};

function decodeEntity(entity: string): string {
  if (entity.startsWith("#x") || entity.startsWith("#X")) {
    const code = Number.parseInt(entity.slice(2), 16);
    return Number.isFinite(code) ? String.fromCodePoint(code) : "";
  }
  if (entity.startsWith("#")) {
    const code = Number.parseInt(entity.slice(1), 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : "";
  }
  return NAMED_ENTITIES[entity.toLowerCase()] ?? "";
}

function stripTrailingHashtags(text: string): string {
  const paragraphs = text.split("\n\n");
  while (paragraphs.length > 0) {
    const last = paragraphs[paragraphs.length - 1] ?? "";
    if (/^(?:#\S+\s*)+$/.test(last)) {
      paragraphs.pop();
      continue;
    }
    const stripped = last.replace(/(?:\s*#\S+)+\s*$/g, "").trim();
    if (stripped === last) break;
    if (stripped) paragraphs[paragraphs.length - 1] = stripped;
    else paragraphs.pop();
  }
  return paragraphs.join("\n\n").trim();
}

/** Plain literary blurb: no HTML, no shop hashtags. */
export function cleanBookDescription(raw: string): string {
  const decoded = raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity: string) =>
      decodeEntity(entity),
    )
    .replace(/\u00a0/g, " ")
    .replace(/\r\n/g, "\n");

  const paragraphs = decoded
    .split(/\n{2,}/)
    .map((para) => para.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return stripTrailingHashtags(paragraphs.join("\n\n"));
}

export function descriptionParagraphs(
  raw: string | null | undefined,
): string[] {
  const cleaned = cleanBookDescription(raw ?? "");
  return cleaned ? cleaned.split("\n\n") : [];
}

export function snippet(text: string, max = 160): string {
  const compact = cleanBookDescription(text).replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max).trimEnd()}…`;
}
