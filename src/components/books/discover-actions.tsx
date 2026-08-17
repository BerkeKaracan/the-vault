"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addGoogleBook } from "@/app/(app)/materials/[id]/actions";
import { MetricFields } from "@/components/materials/catalog-fields";
import type { ErrorKey } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/provider";
import type { MetricType } from "@/lib/types";

function translateError(
  dictionary: ReturnType<typeof useI18n>["dictionary"],
  code: string,
) {
  if (code in dictionary.errors) {
    return dictionary.errors[code as ErrorKey];
  }
  return dictionary.errors.generic;
}

export function DiscoverActions({
  googleId,
  ownedHref,
}: {
  googleId: string;
  ownedHref: string | null;
}) {
  const { dictionary } = useI18n();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [metricType, setMetricType] = useState<MetricType>("pages");
  const [tags, setTags] = useState("");

  function add(status: "active" | "shelved") {
    setMessage(null);
    startTransition(async () => {
      const result = await addGoogleBook(googleId, status, {
        metricType,
        tags,
      });
      if (!result.ok) {
        setMessage(translateError(dictionary, result.error));
        return;
      }
      router.push(`/materials/${result.data.id}`);
    });
  }

  if (ownedHref) {
    return (
      <Link
        href={ownedHref}
        className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition hover:opacity-90"
      >
        {dictionary.book.openInVault}
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <MetricFields
        metricType={metricType}
        onMetricChange={setMetricType}
        tags={tags}
        onTagsChange={setTags}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => add("active")}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition hover:opacity-90 disabled:opacity-40"
        >
          {dictionary.add.addToDesk}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => add("shelved")}
          className="rounded-full border border-border px-4 py-2 text-sm text-foreground/80 transition hover:border-foreground/25 disabled:opacity-40"
        >
          {dictionary.add.addToVault}
        </button>
      </div>
      {message ? (
        <output className="font-mono text-xs text-muted">{message}</output>
      ) : null}
    </div>
  );
}
