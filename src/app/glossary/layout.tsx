import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glossary | Switchy",
  description:
    "Searchable glossary of mechanical keyboard terms covering switches, keycaps, mounting styles, mods, and more.",
};

export default function GlossaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
