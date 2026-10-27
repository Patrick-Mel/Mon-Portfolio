"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { StatusPage } from "@/components/layout/status-page";
import { Button, buttonClasses } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("error");
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <StatusPage code={t("code")} title={t("title")} text={t("text")}>
      <Button onClick={reset}>{t("retry")}</Button>
      <Link href="/" className={buttonClasses({ variant: "secondary" })}>
        {t("home")}
      </Link>
    </StatusPage>
  );
}
