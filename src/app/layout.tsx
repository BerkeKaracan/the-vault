import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import { CookieBanner } from "@/components/cookie-banner";
import { PreferencesProvider } from "@/components/preferences";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { I18nProvider } from "@/i18n/provider";
import { isAccentColor } from "@/lib/catalog/fields";
import { getCookieConsent } from "@/lib/consent";
import { getSessionProfile } from "@/lib/profile";
import { getSiteUrl } from "@/lib/site";
import { isColorScheme } from "@/lib/theme";
import { getColorScheme } from "@/lib/theme-server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const [dictionary, locale] = await Promise.all([
    getDictionary(),
    getLocale(),
  ]);
  const site = getSiteUrl();
  const ogLocale = locale === "en" ? "en_US" : "tr_TR";

  return {
    metadataBase: new URL(site),
    title: {
      default: dictionary.brand,
      template: `%s · ${dictionary.brand}`,
    },
    description: dictionary.meta.description,
    applicationName: dictionary.brand,
    appleWebApp: {
      capable: true,
      title: dictionary.brand,
      statusBarStyle: "black-translucent",
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      alternateLocale: locale === "en" ? ["tr_TR"] : ["en_US"],
      url: site,
      siteName: dictionary.brand,
      title: dictionary.brand,
      description: dictionary.meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: dictionary.brand,
      description: dictionary.meta.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    { media: "(prefers-color-scheme: light)", color: "#f6f6f4" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const dictionary = await getDictionary();
  const consent = await getCookieConsent();
  const [cookieScheme, session] = await Promise.all([
    getColorScheme(),
    getSessionProfile(),
  ]);

  const accent =
    session.profile?.accent_color && isAccentColor(session.profile.accent_color)
      ? session.profile.accent_color
      : "emerald";
  const colorScheme =
    session.profile?.color_scheme && isColorScheme(session.profile.color_scheme)
      ? session.profile.color_scheme
      : cookieScheme;

  return (
    <html
      lang={locale}
      data-theme={colorScheme}
      data-accent={accent}
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} antialiased ${colorScheme === "dark" ? "dark" : ""}`}
    >
      <body className="flex min-h-dvh flex-col bg-background text-foreground">
        <I18nProvider locale={locale} dictionary={dictionary}>
          <PreferencesProvider
            accent={accent}
            dailyGoal={session.profile?.daily_goal ?? null}
            focusMode={session.profile?.focus_mode ?? false}
            colorScheme={colorScheme}
          >
            {children}
            {consent ? null : <CookieBanner />}
          </PreferencesProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
