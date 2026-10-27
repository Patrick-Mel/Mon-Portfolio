import { getTranslations } from "next-intl/server";
import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

type Href = ComponentProps<typeof Link>["href"];

export async function Breadcrumb({ items }: { items: { label: string; href?: Href }[] }) {
  const t = await getTranslations("meta");
  return (
    <nav aria-label={t("breadcrumb")}>
      <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-subtle">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden>/</span>}
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-fg">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="line-clamp-1 text-muted">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
