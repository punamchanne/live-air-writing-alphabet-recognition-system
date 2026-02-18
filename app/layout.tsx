import type { Metadata } from "next";
import { Outfit, Orbitron } from "next/font/google"; // Modern & Futuristic fonts
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Aero Graph Pro | Neural Air-Writing Studio",
  description: "Experience the future of gesture-to-text with Aero Graph's neural-link air-writing technology.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${orbitron.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
