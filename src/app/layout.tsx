import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AeroResponse | Props for a Purpose",
  description: "Volunteer pilot and mission coordination platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
