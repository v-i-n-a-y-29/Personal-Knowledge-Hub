import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal Knowledge Hub",
  description: "Save, organize, and search your favorite resources.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
