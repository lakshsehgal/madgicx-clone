import type { Metadata } from "next";
import "./globals.css";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";

export const metadata: Metadata = {
  title: "Madgicx - Marketing Dashboard",
  description:
    "Unified marketing performance dashboard with Meta, Google & Shopify data via Windsor.ai",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <WorkspaceProvider>{children}</WorkspaceProvider>
      </body>
    </html>
  );
}
