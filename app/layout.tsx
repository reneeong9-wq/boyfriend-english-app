import type { Metadata } from "next";
import "./globals.css";
import BottomNavigation from "@/components/BottomNavigation";

export const metadata: Metadata = {
  title: "Mengze English",
  description: "A personalized English learning website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="bg-slate-100 text-slate-900 antialiased">
        <main className="mx-auto min-h-screen max-w-md bg-white pb-24">
          {children}
        </main>

        <BottomNavigation />
      </body>
    </html>
  );
}