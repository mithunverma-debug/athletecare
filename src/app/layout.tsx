import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AthleteCare — Daily Sports Wellness, Readiness & Rehabilitation Platform",
  description:
    "A centralized daily wellness, fatigue, hydration, and injury rehabilitation platform for athletes, coaches, and sports medical personnel.",
  keywords: [
    "athlete wellness",
    "sports readiness tracking",
    "collegiate athletics",
    "injury rehabilitation",
    "daily check-in",
    "sports medicine",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-navy-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
