import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AeroResponse",
  description: "Volunteer pilot and mission coordination platform.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" className="bg-surface">
      <body>{children}</body>
    </html>
  );
}
