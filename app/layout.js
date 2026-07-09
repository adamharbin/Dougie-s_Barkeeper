import { Oswald, Noto_Serif, Caveat } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-head",
  display: "swap",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-body",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-accent",
  display: "swap",
});

export const metadata = {
  title: "BarKeeper — Dougie's Dog Bar",
  description: "Inventory, recipe, vendor, and cost management for Dougie's Dog Bar.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${oswald.variable} ${notoSerif.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
