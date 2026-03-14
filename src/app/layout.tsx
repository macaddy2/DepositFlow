import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DepositGuard — Inspect, Repair & Recover",
  description: "Don't lose your deposit. DepositGuard helps tenants submit video walkthroughs, get risk assessments, book repairs, and build evidence trails before the landlord inspection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-slate-900" style={{ fontFamily: "system-ui, -apple-system, Calibri, 'Segoe UI', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
