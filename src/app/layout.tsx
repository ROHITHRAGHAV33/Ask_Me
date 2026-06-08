import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "FitQuest Arena - Gamified Fitness Trivia & Polls",
  description: "Test your fitness knowledge, vote on active polls, climb the leaderboard, improve questions with AI, and learn health insights!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#050811] text-slate-100">{children}</body>
    </html>
  );
}

