import Link from "next/link";
import type { ReactNode } from "react";
import { DeskPanel, HeatPanel, VaultPanel } from "@/components/landing/mocks";
import { PointerGlow } from "@/components/landing/pointer-glow";
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
    <section className="reveal grid items-center gap-10 border-t border-white/6 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
      <div className={flip ? "lg:order-2" : undefined}>
        <span className="font-mono text-[0.65rem] tracking-[0.3em] text-emerald-400/70">
          {index}
        </span>
        <h2 className="font-display mt-5 text-[clamp(1.9rem,4vw,3.1rem)] leading-[1.02] font-semibold tracking-[-0.03em] text-zinc-50">
          {title}
        </h2>
        <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-zinc-400">
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
    <div className="relative flex min-h-dvh flex-col bg-[#08080a] text-zinc-100">
      {/* Fixed atmosphere: never contributes to layout, so it cannot create a scrollport. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_75%_-5%,rgba(74,222,128,0.10),transparent_60%),radial-gradient(ellipse_60%_50%_at_5%_100%,rgba(120,53,15,0.14),transparent_55%),linear-gradient(180deg,#0b0b0d_0%,#08080a_45%,#050506_100%)]" />
        <div className="landing-atmosphere absolute top-[-25%] right-[-15%] size-[75vh] rounded-full bg-[radial-gradient(circle,rgba(74,222,128,0.10),transparent_65%)] blur-3xl" />
        <div className="landing-atmosphere absolute bottom-[-25%] left-[-15%] size-[65vh] rounded-full bg-[radial-gradient(circle,rgba(250,250,249,0.05),transparent_65%)] blur-3xl" />
        <div className="landing-hairlines absolute inset-0" />
        <div className="landing-grain absolute inset-[-50%] opacity-[0.16]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_45%,transparent_20%,rgba(3,3,4,0.75)_100%)]" />
      </div>

      <PointerGlow />

      <header className="sticky top-0 z-40 border-b border-white/6 bg-[#08080a]/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
          <Link
            href="/"
            className="font-mono text-[0.7rem] tracking-[0.3em] text-zinc-300 uppercase transition hover:text-white"
          >
            {dictionary.brand}
          </Link>
          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="rounded-full border border-white/12 px-4 py-1.5 text-[0.8rem] text-zinc-300 transition hover:border-white/25 hover:bg-white/4 hover:text-white"
            >
              {landing.ctaPrimary}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 sm:px-10">
        <section className="grid items-center gap-16 py-16 lg:min-h-[calc(100dvh-4.5rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-0">
          <div>
            <p className="landing-rise inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1.5 font-mono text-[0.62rem] tracking-[0.22em] text-zinc-400 uppercase">
              <span className="landing-pulse size-1.5 rounded-full bg-emerald-400" />
              {landing.eyebrow}
            </p>

            <h1 className="font-display mt-7 text-[clamp(2.5rem,6.5vw,4.75rem)] leading-[0.98] font-semibold tracking-[-0.045em]">
              <span className="landing-rise landing-rise-delay-1 block text-zinc-500">
                {landing.headlineLine1}
              </span>
              <span className="landing-rise landing-rise-delay-2 block text-zinc-50">
                {landing.headlineLine2}
              </span>
            </h1>

            <p className="landing-rise landing-rise-delay-2 mt-7 max-w-xl text-[1rem] leading-relaxed text-zinc-400 sm:text-[1.05rem]">
              {landing.sub}
            </p>

            <div className="landing-rise landing-rise-delay-3 mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="rounded-full bg-emerald-400 px-6 py-3 text-[0.9rem] font-medium text-emerald-950 transition hover:bg-emerald-300"
              >
                {landing.closingCta}
              </Link>
              <Link
                href="#manifesto"
                className="rounded-full border border-white/12 px-6 py-3 text-[0.9rem] text-zinc-300 transition hover:border-white/25 hover:bg-white/4 hover:text-white"
              >
                {landing.ctaSecondary}
              </Link>
            </div>

            <dl className="landing-rise landing-rise-delay-3 mt-14 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/8 bg-white/7">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-[#08080a]/90 px-4 py-4">
                  <dt className="font-display text-2xl leading-none font-semibold text-zinc-100">
                    {stat.value}
                  </dt>
                  <dd className="mt-2 font-mono text-[0.58rem] leading-snug tracking-wide text-zinc-500 uppercase">
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
                <li key={kind.title} className="border-t border-white/8 pt-3">
                  <p className="font-mono text-[0.58rem] tracking-[0.22em] text-zinc-400 uppercase">
                    {kind.title}
                  </p>
                  <p className="mt-1.5 text-[0.72rem] leading-snug text-zinc-600">
                    {kind.hint}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="landing-rise landing-rise-delay-2 relative">
            <div
              aria-hidden
              className="absolute -inset-8 rounded-4xl bg-[radial-gradient(circle_at_50%_30%,rgba(74,222,128,0.12),transparent_70%)] blur-2xl"
            />
            <div className="landing-tilt relative">
              <DeskPanel dictionary={dictionary} />
            </div>
          </div>
        </section>

        <section
          id="manifesto"
          className="reveal grid gap-12 border-t border-white/6 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24"
        >
          <div>
            <h2 className="font-display max-w-md text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-zinc-50">
              {landing.manifestoTitle}
            </h2>
            <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-zinc-400">
              {landing.manifestoBody}
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[0.6rem] tracking-[0.3em] text-zinc-600 uppercase">
                {landing.removedTitle}
              </p>
              <ul className="mt-5 space-y-3">
                {landing.removed.map((item) => (
                  <li
                    key={item}
                    className="text-[0.9rem] text-zinc-600 line-through decoration-zinc-700"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[0.6rem] tracking-[0.3em] text-emerald-400/70 uppercase">
                {landing.keptTitle}
              </p>
              <ul className="mt-5 space-y-3">
                {landing.kept.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[0.9rem] text-zinc-200"
                  >
                    <span className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <Act
          index="01"
          title={landing.deskTitle}
          body={landing.deskBody}
          visual={<DeskPanel dictionary={dictionary} variant="limit" />}
        />
        <Act
          index="02"
          title={landing.heatTitle}
          body={landing.heatBody}
          visual={<HeatPanel dictionary={dictionary} />}
          flip
        />
        <Act
          index="03"
          title={landing.vaultTitle}
          body={landing.vaultBody}
          visual={<VaultPanel dictionary={dictionary} />}
        />

        <section className="reveal border-t border-white/6 py-24 text-center lg:py-32">
          <h2 className="font-display mx-auto max-w-3xl text-[clamp(2.4rem,7vw,5rem)] leading-[0.98] font-semibold tracking-[-0.045em] text-zinc-50">
            {landing.closingTitle}
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[0.95rem] leading-relaxed text-zinc-400">
            {landing.closingBody}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              href="/login"
              className="rounded-full bg-emerald-400 px-8 py-3.5 text-[0.95rem] font-medium text-emerald-950 transition hover:bg-emerald-300"
            >
              {landing.closingCta}
            </Link>
            <p className="font-mono text-[0.62rem] tracking-[0.18em] text-zinc-600 uppercase">
              {landing.closingNote}
            </p>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p className="font-mono text-[0.65rem] tracking-[0.3em] text-zinc-500 uppercase">
            {dictionary.brand}
          </p>
          <p className="text-[0.78rem] text-zinc-600">{landing.footerNote}</p>
          <LanguageSwitcher />
        </div>
      </footer>
    </div>
  );
}
