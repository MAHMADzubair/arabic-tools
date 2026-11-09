/**
 * lib/editorialFonts.js
 *
 * Display fonts for editorial trust pages (Contact, Changelog).
 * Applied through the `.variable` class on the page wrapper only, so other
 * pages do not download these files.
 */
import { Noto_Naskh_Arabic, IBM_Plex_Mono } from "next/font/google";

export const naskhDisplay = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-qnaskh",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
  variable: "--font-qmono",
});

export const editorialFontClass = `${naskhDisplay.variable} ${plexMono.variable}`;
