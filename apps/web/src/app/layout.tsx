import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { WaitlistGate } from "@/components/waitlist-gate";

export const metadata: Metadata = {
  title: "Ezriya - Real Estate Platform",
  description: "A modern real estate platform for clients, agents, and vendor collaboration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <WaitlistGate>{children}</WaitlistGate>
        </ThemeProvider>
      </body>
    </html>
  );
}
