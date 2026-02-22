import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keyboard Explorer | Switchy",
  description:
    "Discover mechanical keyboard kits by size, features, and price. Filter by hot-swap, wireless, and more.",
};

export default function KeyboardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
