import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";

/** Polices auto-hébergées par next/font (aucune requête vers Google côté visiteur). */
export const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500"],
  preload: false,
});

export const fontVariables = `${display.variable} ${sans.variable} ${mono.variable}`;
