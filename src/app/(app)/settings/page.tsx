import { SettingsForm } from "@/app/(app)/settings/settings-form";
import { getSessionProfile } from "@/app/(app)/settings-actions";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCookieConsent } from "@/lib/consent";

export default async function SettingsPage() {
  const [dictionary, session, consent] = await Promise.all([
    getDictionary(),
    getSessionProfile(),
    getCookieConsent(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10">
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
