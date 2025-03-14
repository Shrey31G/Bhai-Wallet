import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Provider } from "./provider";
import { AppbarClient } from "../components/AppbarClient";
import { JSX } from "react";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wallet",
  description: "Simple Wallet App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <html lang="en">
      <Provider>
        <AppbarClient />
        <body className={inter.className}>
          {children}
        </body>
      </Provider>
    </html>
  );
}
