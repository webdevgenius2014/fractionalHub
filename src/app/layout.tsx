import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FractionalHub - Connect with Fractional C-Suite Executives",
  description:
    "Find fractional CTOs, CMOs, CFOs, COOs, and more for your company. Or join as an executive and work with multiple companies.",
  keywords: "fractional CTO, fractional CMO, fractional executive, part-time CTO",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
