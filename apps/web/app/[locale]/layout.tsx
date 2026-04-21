import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import { AntdProvider } from "@/components/providers/AntdProvider";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CommandPalette } from "@/components/common/CommandPalette/CommandPalette";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#0c1324",
};

export const metadata: Metadata = {
  title: {
    default: "Nurox ERP",
    template: "%s — Nurox ERP",
  },
  description:
    "Enterprise Resource Planning — HR, Payroll, Finance, Inventory, Sales & Projects",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

const locales = ["en", "bn", "ar"];

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) {
    notFound();
  }

  // Receiving messages provided in `i18n.ts`
  const messages = await getMessages();


  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${spaceGrotesk.variable} ${manrope.variable}`}
    >
      <body style={{ fontFamily: "var(--font-body)" }}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReduxProvider>
            <AuthProvider>
              <AntdProvider locale={locale} direction={direction}>
                {children}
                <CommandPalette />
              </AntdProvider>
            </AuthProvider>
          </ReduxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
