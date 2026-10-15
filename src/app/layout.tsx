import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthProvider";
import { getCurrentUser } from "@/lib/supabase/user";
import { formatClockTime } from "@/lib/format";
import { Navbar } from "@/components/ui/Navbar";
import { Background } from "@/components/ui/Background";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: { default: "Zero Reload Auth Dashboard", template: "%s · Zero Reload Auth" },
  description:
    "A Next.js + Supabase demo of seamless authentication: sign up, log in, and log out without a single page reload.",
};

/**
 * Root layout: rendered on the server for every request.
 *
 * It reads the verified user once and hands it to <AuthProvider>. Every
 * navigation and every auth action is a full document load, so this layout
 * (and the "Page loaded" timestamp it renders) is re-created fresh each time.
 *
 * <ThemeProvider> owns light/dark/system (persisted in localStorage). The
 * proxy's CSP nonce is forwarded so its no-flash inline script passes
 * `script-src` without needing 'unsafe-inline'.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  // Server-rendered once per request; the badge below proves each navigation
  // is a real document load.
  const loadedAt = formatClockTime(new Date());

  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange nonce={nonce}>
          <Background />
          <AuthProvider initialUser={user}>
            <Navbar loadedAt={loadedAt} />
            <main className="mx-auto max-w-6xl px-5">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
