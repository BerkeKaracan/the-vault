import Link from "next/link";
import type { ReactNode } from "react";
import { DeskPanel, HeatPanel, VaultPanel } from "@/components/landing/mocks";
import { PointerGlow } from "@/components/landing/pointer-glow";
import { ThemeToggle } from "@/components/theme-toggle";
import { getDictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "@/i18n/language-switcher";

function Act({
  index,
  title,
  body,
  visual,
  flip = false,
}: {
  index: string;
  title: string;
  body: string;
  visual: ReactNode;
  flip?: boolean;
}) {
  return (
    <section className="reveal grid items-center gap-10 border-t border-border py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
      <div className={flip ? "lg:order-2" : undefined}>
        <span className="font-mono text-[0.65rem] tracking-[0.3em] text-accent/70">
          {index}
        </span>
        <h2 className="font-display mt-5 text-[clamp(1.9rem,4vw,3.1rem)] leading-[1.02] font-semibold tracking-[-0.03em] text-foreground">
          {title}
        </h2>
        <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-muted">
          {body}
        </p>
      </div>
      <div className={flip ? "lg:order-1" : undefined}>{visual}</div>
    </section>
  );
}

export default async function LandingPage() {
  const dictionary = await getDictionary();
  const { landing } = dictionary;

  const stats = [
    { value: "3", label: landing.statDeskLabel },
    { value: "0", label: landing.statNoiseLabel },
    { value: "1", label: landing.statDailyLabel },
  ];

  return (
    <div className="relative flex min-h-dvh flex-col bg-background text-foreground">
      {/* Fixed atmosphere: never contributes to layout, so it cannot create a scrollport. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="landing-wash absolute inset-0" />
        <div className="landing-atmosphere absolute top-[-25%] right-[-15%] size-[75vh] rounded-full bg-[radial-gradient(circle,var(--accent-glow),transparent_65%)] blur-3xl" />
        <div className="landing-atmosphere landing-orb-warm absolute bottom-[-25%] left-[-15%] size-[65vh] rounded-full blur-3xl" />
        <div className="landing-hairlines absolute inset-0" />
        <div className="landing-grain absolute inset-[-50%]" />
        <div className="landing-vignette absolute inset-0" />
      </div>

      <PointerGlow />

      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
          <Link
            href="/"
            className="font-mono text-[0.7rem] tracking-[0.3em] text-foreground/80 uppercase transition hover:text-foreground"
          >
            {dictionary.brand}
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="hidden items-center gap-4 text-[0.8rem] text-muted sm:flex">
              <Link href="#how" className="hover:text-foreground">
                {landing.navHow}
              </Link>
              <Link href="#library" className="hover:text-foreground">
                {landing.navLibrary}
              </Link>
              <Link href="#log" className="hover:text-foreground">
                {landing.navLog}
              </Link>
            </nav>
            <ThemeToggle />
            <LanguageSwitcher />
            <Link
              href="/login"
              className="rounded-full border border-border px-4 py-1.5 text-[0.8rem] text-foreground/80 transition hover:border-foreground/25 hover:bg-foreground/5 hover:text-foreground"
            >
              {landing.ctaPrimary}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 sm:px-10">
        <section className="grid items-center gap-16 py-16 lg:min-h-[calc(100dvh-4.5rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-0">
          <div>
            <p className="landing-rise inline-flex items-center gap-2 rounded-full border border-border bg-foreground/5 px-3 py-1.5 font-mono text-[0.62rem] tracking-[0.22em] text-muted uppercase">
              <span className="landing-pulse size-1.5 rounded-full bg-accent" />
              {landing.eyebrow}
            </p>

            <h1 className="font-display mt-7 text-[clamp(2.5rem,6.5vw,4.75rem)] leading-[0.98] font-semibold tracking-[-0.045em]">
              <span className="landing-rise landing-rise-delay-1 block text-muted">
                {landing.headlineLine1}
              </span>
              <span className="landing-rise landing-rise-delay-2 block text-foreground">
                {landing.headlineLine2}
              </span>
            </h1>

            <p className="landing-rise landing-rise-delay-2 mt-7 max-w-xl text-[1rem] leading-relaxed text-muted sm:text-[1.05rem]">
              {landing.sub}
            </p>

            <div className="landing-rise landing-rise-delay-3 mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="rounded-full bg-accent px-6 py-3 text-[0.9rem] font-medium text-accent-fg transition hover:opacity-90"
              >
                {landing.closingCta}
              </Link>
              <Link
                href="#how"
                className="rounded-full border border-border px-6 py-3 text-[0.9rem] text-foreground/80 transition hover:border-foreground/25 hover:bg-foreground/5 hover:text-foreground"
              >
                {landing.ctaSecondary}
              </Link>
            </div>

            <dl className="landing-rise landing-rise-delay-3 mt-14 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-foreground/5">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-surface/90 px-4 py-4">
                  <dt className="font-display text-2xl leading-none font-semibold text-foreground">
                    {stat.value}
                  </dt>
                  <dd className="mt-2 font-mono text-[0.58rem] leading-snug tracking-wide text-muted uppercase">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>

            <ul className="landing-rise landing-rise-delay-3 mt-8 grid max-w-lg grid-cols-3 gap-3">
              {[
                { title: landing.kindBook, hint: landing.kindBookHint },
                { title: landing.kindSet, hint: landing.kindSetHint },
                { title: landing.kindDocs, hint: landing.kindDocsHint },
              ].map((kind) => (
                <li key={kind.title} className="border-t border-border pt-3">
                  <p className="font-mono text-[0.58rem] tracking-[0.22em] text-muted uppercase">
                    {kind.title}
                  </p>
                  <p className="mt-1.5 text-[0.72rem] leading-snug text-muted">
                    {kind.hint}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="landing-rise landing-rise-delay-2 relative">
            <div
              aria-hidden
              className="absolute -inset-8 rounded-4xl bg-[radial-gradient(circle_at_50%_30%,var(--accent-glow),transparent_70%)] blur-2xl"
            />
            <div className="landing-tilt relative">
              <DeskPanel dictionary={dictionary} />
            </div>
          </div>
        </section>

        <section
          id="how"
          className="reveal grid gap-12 border-t border-border py-16 lg:grid-cols-2 lg:gap-20 lg:py-24"
        >
          <div>
            <h2 className="font-display max-w-md text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-foreground">
              {landing.manifestoTitle}
            </h2>
            <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-muted">
              {landing.manifestoBody}
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[0.6rem] tracking-[0.3em] text-muted uppercase">
                {landing.removedTitle}
              </p>
              <ul className="mt-5 space-y-3">
                {landing.removed.map((item) => (
                  <li
                    key={item}
                    className="text-[0.9rem] text-muted line-through decoration-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[0.6rem] tracking-[0.3em] text-accent/70 uppercase">
                {landing.keptTitle}
              </p>
              <ul className="mt-5 space-y-3">
                {landing.kept.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[0.9rem] text-foreground/80"
                  >
                    <span className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section
          id="tour"
          className="reveal border-t border-border py-16 lg:py-24"
        >
          <h2 className="font-display text-[clamp(1.9rem,4vw,3.1rem)] leading-[1.02] font-semibold tracking-[-0.03em] text-foreground">
            {landing.tourTitle}
          </h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: landing.tourDesk, hint: landing.tourDeskHint },
              { title: landing.tourLibrary, hint: landing.tourLibraryHint },
              { title: landing.tourDiscover, hint: landing.tourDiscoverHint },
              { title: landing.tourLog, hint: landing.tourLogHint },
            ].map((item) => (
              <li key={item.title} className="border-t border-border pt-4">
                <p className="font-mono text-[0.62rem] tracking-[0.22em] text-accent/70 uppercase">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.hint}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <Act
          index="01"
          title={landing.deskTitle}
          body={landing.deskBody}
          visual={<DeskPanel dictionary={dictionary} variant="limit" />}
        />
        <div id="log">
          <Act
            index="02"
            title={landing.heatTitle}
            body={landing.heatBody}
            visual={<HeatPanel dictionary={dictionary} />}
            flip
          />
        </div>
        <div id="library">
          <Act
            index="03"
            title={landing.vaultTitle}
            body={landing.vaultBody}
            visual={<VaultPanel dictionary={dictionary} />}
          />
        </div>

        <section className="reveal border-t border-border py-16 lg:py-24">
          <h2 className="font-display max-w-md text-[clamp(1.9rem,4vw,3.1rem)] leading-[1.02] font-semibold tracking-[-0.03em] text-foreground">
            {landing.shelvesPitchTitle}
          </h2>
          <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-muted">
            {landing.shelvesPitchBody}
          </p>
        </section>

        <section className="reveal border-t border-border py-24 text-center lg:py-32">
          <h2 className="font-display mx-auto max-w-3xl text-[clamp(2.4rem,7vw,5rem)] leading-[0.98] font-semibold tracking-[-0.045em] text-foreground">
            {landing.closingTitle}
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[0.95rem] leading-relaxed text-muted">
            {landing.closingBody}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              href="/login"
              className="rounded-full bg-accent px-8 py-3.5 text-[0.95rem] font-medium text-accent-fg transition hover:opacity-90"
            >
              {landing.closingCta}
            </Link>
            <p className="font-mono text-[0.62rem] tracking-[0.18em] text-muted uppercase">
              {landing.closingNote}
            </p>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 sm:px-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[0.65rem] tracking-[0.3em] text-muted uppercase">
              {dictionary.brand}
            </p>
            <nav className="flex flex-wrap gap-4 text-[0.78rem] text-muted">
              <Link href="/login?next=/desk" className="hover:text-foreground">
                {dictionary.nav.desk}
              </Link>
              <Link
                href="/login?next=/library"
                className="hover:text-foreground"
              >
                {dictionary.nav.library}
              </Link>
              <Link
                href="/login?next=/discover"
                className="hover:text-foreground"
              >
                {dictionary.nav.discover}
              </Link>
              <Link href="/login" className="hover:text-foreground">
                {landing.ctaPrimary}
              </Link>
            </nav>
            <LanguageSwitcher />
          </div>
          <p className="text-[0.78rem] text-muted">{landing.footerNote}</p>
          <p className="font-mono text-[0.62rem] tracking-[0.18em] text-muted uppercase">
            {landing.footerNoSocial}
          </p>
        </div>
      </footer>
    </div>
  );
}
