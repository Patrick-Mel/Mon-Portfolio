/**
 * Sérialisation CSV compatible Excel (BOM UTF-8, séparateur « ; » courant en français).
 * Les cellules commençant par = + - @ sont préfixées d'une apostrophe :
 * protection contre l'injection de formules (CSV injection).
 */
export function toCsv(rows: Record<string, unknown>[], columns: { key: string; label: string }[]): string {
  const cell = (v: unknown) => {
    let s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const head = columns.map((c) => cell(c.label)).join(";");
  const body = rows.map((r) => columns.map((c) => cell(r[c.key])).join(";")).join("\r\n");
  return `﻿${head}\r\n${body}`;
}
