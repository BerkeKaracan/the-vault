import { getSessionProfile } from "@/app/(app)/settings-actions";
import { SettingsForm } from "@/app/(app)/settings/settings-form";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCookieConsent } from "@/lib/consent";

export default async function SettingsPage() {
  const [dictionary, session, consent] = await Promise.all([
    getDictionary(),
    getSessionProfile(),
    getCookieConsent(),
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <h1 className="font-display text-2xl font-semibold tracking-[-0.03em] text-zinc-50">
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
