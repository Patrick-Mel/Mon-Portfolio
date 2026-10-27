import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/lib/locale";

const STATUSES = ["confirmed", "unsubscribed", "invalid"] as const;
type Status = (typeof STATUSES)[number];
const isStatus = (s: string): s is Status => (STATUSES as readonly string[]).includes(s);

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => STATUSES.map((status) => ({ locale, status })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/[locale]/newsletter/[status]">): Promise<Metadata> {
  await resolveLocale(params);
  const { status } = await params;
  const t = await getTranslations("newsletter.status");
  return { title: isStatus(status) ? t(`${status}.title`) : undefined, robots: { index: false } };
}

/** Page d'arrivée des liens de confirmation / désinscription (voir /api/newsletter). */
export default async function NewsletterStatusPage({ params }: PageProps<"/[locale]/newsletter/[status]">) {
  await resolveLocale(params);
  const { status } = await params;
  if (!isStatus(status)) notFound();
  const t = await getTranslations("newsletter");
  return (
    <section className="container-site grid min-h-[60vh] place-items-center py-20">
      <div className="max-w-xl text-center">
        <p className={`layer-label mb-6 ${status === "invalid" ? "text-danger" : "text-success"}`}>Newsletter</p>
        <h1 className="text-h2">{t(`status.${status}.title`)}</h1>
        <p className="mt-5 text-lead text-muted">{t(`status.${status}.text`)}</p>
        <Link href="/" className={buttonClasses({ className: "mt-10" })}>
          {t("backHome")} <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}
