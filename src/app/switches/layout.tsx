import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Switch Explorer | Switchy",
  description:
    "Browse, filter, and compare mechanical keyboard switches by type, force, sound, and brand.",
};

export default function SwitchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
