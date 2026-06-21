import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import InstallApp from "@/components/InstallApp";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spotimization - Street Parking Spot Optimization",
  description:
    "Spotimization optimizes street parking spot matching using AI agentic technology for Long Beach, CA.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Spotimization",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/pwa-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">
        {children}
        <InstallApp />
      </body>
    </html>
  );
}
