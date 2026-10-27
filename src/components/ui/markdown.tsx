import { cn } from "@/lib/cn";
import { renderMarkdown } from "@/lib/markdown";

/** Contenu Markdown rendu côté serveur (HTML déjà assaini par le pipeline). */
export async function Markdown({ source, className }: { source: string; className?: string }) {
  const { html } = await renderMarkdown(source);
  return <div className={cn("prose-signal", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
