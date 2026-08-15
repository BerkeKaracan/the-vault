import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import { CookieBanner } from "@/components/cookie-banner";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { I18nProvider } from "@/i18n/provider";
import { getCookieConsent } from "@/lib/consent";
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
  const dictionary = await getDictionary();
  return {
    title: dictionary.brand,
    description: dictionary.meta.description,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const dictionary = await getDictionary();
  const consent = await getCookieConsent();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} dark antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-background text-foreground">
        <I18nProvider locale={locale} dictionary={dictionary}>
          {children}
          {consent ? null : <CookieBanner />}
        </I18nProvider>
      </body>
    </html>
  );
}
