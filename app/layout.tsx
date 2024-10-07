import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "../redux/provider";
import ProtectedRoute from "./protectedRoute/protectedRoute";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HI Chat",
  description: "Created By Hariharan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}><ReduxProvider><ProtectedRoute>{children}</ProtectedRoute></ReduxProvider></body>
    </html>
  );
}
