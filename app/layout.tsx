import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
})
 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Focus Board',
  description: 'A Kanban-style task manager with live data and drag-and-drop',
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fraunces.variable}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
