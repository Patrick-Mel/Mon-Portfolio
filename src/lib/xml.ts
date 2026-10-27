const XML_ENTITIES: Record<string, string> = {
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  "'": "&apos;",
  '"': "&quot;",
};

export function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => XML_ENTITIES[c] ?? c);
}
