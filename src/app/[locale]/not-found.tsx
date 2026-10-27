import { getTranslations } from "next-intl/server";
import { StatusPage } from "@/components/layout/status-page";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <StatusPage code={t("code")} title={t("title")} text={t("text")}>
      <Link href="/" className={buttonClasses()}>
        {t("home")} <ArrowIcon />
      </Link>
      <Link href="/projects" className={buttonClasses({ variant: "secondary" })}>
        {t("projects")}
      </Link>
      <Link href="/contact" className={buttonClasses({ variant: "ghost" })}>
        {t("contact")}
      </Link>
    </StatusPage>
  );
}
