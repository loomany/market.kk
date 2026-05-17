import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const configuredAppName = process.env.NEXT_PUBLIC_APP_NAME;
const appName =
  configuredAppName && !configuredAppName.toLowerCase().includes("kaspi")
    ? configuredAppName
    : "Vitrina AI Studio";

export const metadata: Metadata = {
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description:
    "AI-студия товарных фото для маркетплейсов: одежда на AI-модели, product shot, чистый фон и проверка качества.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-slate-900">{children}</body>
    </html>
  );
}
