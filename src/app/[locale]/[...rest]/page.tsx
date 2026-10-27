import { notFound } from "next/navigation";

/** Toute route localisée inconnue affiche la 404 localisée. */
export default function CatchAll() {
  notFound();
}
