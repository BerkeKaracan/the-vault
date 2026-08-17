import type { Metadata } from "next";
import { SettingsForm } from "@/app/(app)/settings/settings-form";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCookieConsent } from "@/lib/consent";
import { getSessionProfile } from "@/lib/profile";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: `${dictionary.settings.title} · ${dictionary.brand}` };
}

export default async function SettingsPage() {
  const [dictionary, session, consent] = await Promise.all([
    getDictionary(),
    getSessionProfile(),
    getCookieConsent(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:px-8">
      <h1 className="font-display text-2xl font-semibold tracking-[-0.03em] text-foreground">
        {dictionary.settings.title}
      </h1>
      <div className="mt-10">
        <SettingsForm
          email={session.email}
          profile={session.profile}
          consent={consent}
        />
      </div>
    </main>
  );
}
