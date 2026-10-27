import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader, ExamplePill, fmtDateTime, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Pages légales" };

export default async function LegalAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("legal_pages").select("slug, title, updated_at, is_example").order("slug");
  return (
    <>
      <AdminHeader
        title="Pages légales"
        description="Modèles à adapter. La politique de confidentialité doit refléter exactement ce que le site collecte : mettez-la à jour si vous activez ou désactivez une fonctionnalité."
      />
      <Table>
        <thead>
          <tr>
            <th>Page</th>
            <th>Dernière mise à jour</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((p) => (
            <tr key={p.slug}>
              <td>
                <span className="flex items-center gap-2">
                  <Link href={`/admin/legal/${p.slug}`} className="font-medium hover:text-accent-ink hover:underline">
                    {(p.title as { fr: string }).fr}
                  </Link>
                  {p.is_example && <ExamplePill />}
                </span>
              </td>
              <td className="font-mono text-xs">{fmtDateTime(p.updated_at)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
