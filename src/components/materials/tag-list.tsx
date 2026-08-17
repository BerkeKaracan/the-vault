import { tagTone } from "@/lib/catalog/fields";

export function TagList({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li
          key={tag}
          className={`rounded-full border px-2 py-0.5 font-mono text-[0.62rem] tracking-wide ${tagTone(tag)}`}
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
