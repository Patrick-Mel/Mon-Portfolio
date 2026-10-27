import "server-only";
import rehypeShiki, { type RehypeShikiOptions } from "@shikijs/rehype";
import type { Element, ElementContent, Root } from "hast";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

/** Schéma d'assainissement : GFM standard + langue des blocs de code. Aucun HTML brut. */
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ["className", /^language-[\w-]+$/] as [string, RegExp]],
  },
};

function textOf(node: ElementContent | Element): string {
  if (node.type === "text") return node.value;
  if ("children" in node) return node.children.map((c) => textOf(c as ElementContent)).join("");
  return "";
}

function collectToc(toc: TocItem[]) {
  return () => (tree: Root) => {
    visit(tree, "element", (el: Element) => {
      if ((el.tagName === "h2" || el.tagName === "h3") && typeof el.properties?.id === "string") {
        toc.push({ id: el.properties.id, text: textOf(el), depth: el.tagName === "h2" ? 2 : 3 });
      }
    });
  };
}

/** Les liens externes s'ouvrent dans un nouvel onglet, sans fuite de referrer. */
function externalLinks() {
  return (tree: Root) => {
    visit(tree, "element", (el: Element) => {
      const href = el.properties?.href;
      if (el.tagName === "a" && typeof href === "string" && /^https?:\/\//.test(href)) {
        el.properties.target = "_blank";
        el.properties.rel = ["noopener", "noreferrer"];
      }
    });
  };
}

const shikiOptions: RehypeShikiOptions = {
  themes: { light: "github-light", dark: "github-dark" },
  defaultColor: false,
  fallbackLanguage: "text",
  langs: ["bash", "shell", "powershell", "sql", "ts", "tsx", "js", "json", "yaml", "python", "nginx", "ini", "html", "css", "diff"],
};

/**
 * Markdown → HTML sûr. Le HTML brut est ignoré (pas de `allowDangerousHtml`)
 * puis le résultat est assaini avant la coloration syntaxique.
 */
export async function renderMarkdown(markdown: string): Promise<{ html: string; toc: TocItem[] }> {
  const toc: TocItem[] = [];
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, schema)
    .use(rehypeSlug)
    .use(collectToc(toc))
    .use(externalLinks)
    .use(rehypeShiki, shikiOptions)
    .use(rehypeStringify)
    .process(markdown);
  return { html: String(file), toc };
}
