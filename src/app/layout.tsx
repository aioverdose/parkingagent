import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import InstallApp from "@/components/InstallApp";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
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
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        {children}
        <InstallApp />
      </body>
    </html>
  );
}
