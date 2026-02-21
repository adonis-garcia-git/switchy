import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Outfit } from "next/font/google";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Navigation } from "@/components/Navigation";
import { GlossaryProvider } from "@/components/GlossaryProvider";
import { OnboardingModal } from "@/components/OnboardingModal";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Switchy | AI Keyboard Build Advisor",
  description:
    "Describe your dream typing experience and get a complete, compatible build recommendation with specific products and prices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-bg-primary text-text-primary`}
      >
        <ConvexClientProvider>
          <GlossaryProvider>
            <Navigation />
            <OnboardingModal />
            <main className="pt-16 min-h-screen">
              {children}
            </main>
          </GlossaryProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
