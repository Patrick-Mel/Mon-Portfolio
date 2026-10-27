import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { deleteEntity, toggleField } from "@/app/admin/_actions/content";
import { requireAdmin } from "@/lib/admin/auth";
import { allFields, setPath, type FieldGroup, type Values } from "@/lib/admin/fields";
import { ConfirmButton } from "./confirm-button";
import { EntityForm } from "./entity-form";
import { AdminHeader, EmptyRow, ExamplePill, Table } from "./ui";

export const btnPrimary = "inline-flex h-10 items-center gap-2 rounded-sm bg-accent px-4 text-sm font-medium text-accent-contrast hover:opacity-90";
export const btnSecondary = "inline-flex h-10 items-center gap-2 rounded-sm border border-line-strong px-4 text-sm hover:border-fg";

/** Valeurs initiales d'un nouvel élément d'après les valeurs par défaut des champs. */
export function defaultsFor(groups: FieldGroup[]): Values {
  const v: Values = {};
  for (const f of allFields(groups)) if (f.defaultValue !== undefined) setPath(v, f.name, f.defaultValue);
  return v;
}

/** Page d'édition / création générique : /admin/<x>/new ou /admin/<x>/<id>. */
export async function CrudEditPage({
  entity,
  table,
  id,
  groups,
  title,
  back,
  extra,
  aside,
  select = "*",
}: {
  entity: string;
  table: string;
  id: string;
  groups: FieldGroup[];
  title: (row: Values | null) => string;
  back: { href: string; label: string };
  extra?: (row: Values | null) => ReactNode;
  aside?: (row: Values) => ReactNode;
  select?: string;
}) {
  const { supabase } = await requireAdmin();
  const isNew = id === "new";
  let row: Values | null = null;
  if (!isNew) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
    const { data } = await supabase.from(table).select(select).eq("id", id).maybeSingle();
    if (!data) notFound();
    row = data as Values;
  }

  return (
    <>
      <AdminHeader
        back={back}
        title={title(row)}
        actions={
          row && (
            <form action={deleteEntity}>
              <input type="hidden" name="_entity" value={entity} />
              <input type="hidden" name="_id" value={row.id} />
              <input type="hidden" name="_redirect" value="1" />
              <ConfirmButton className="inline-flex h-10 items-center rounded-sm border border-danger/40 px-4 text-sm text-danger hover:bg-[color-mix(in_oklab,var(--danger)_8%,transparent)]">
                Supprimer
              </ConfirmButton>
            </form>
          )
        }
      />
      {row?.is_example && (
        <p className="mb-6 rounded-md border border-warning/40 bg-[color-mix(in_oklab,var(--warning)_10%,transparent)] px-4 py-3 text-sm">
          <strong>Contenu d&apos;exemple.</strong> Remplacez ce texte par le vôtre, puis décochez « Contenu d&apos;exemple ».
        </p>
      )}
      <EntityForm entity={entity} id={row?.id} groups={groups} values={row ?? defaultsFor(groups)} extra={extra?.(row)} submitLabel={isNew ? "Créer" : "Enregistrer"} />
      {row && aside?.(row)}
    </>
  );
}

export interface Column {
  label: string;
  render: (row: Values) => ReactNode;
  className?: string;
}

/** Liste générique avec lien d'édition sur la première colonne. */
export function CrudTable({ rows, columns, basePath, empty }: { rows: Values[]; columns: Column[]; basePath: string; empty: string }) {
  return (
    <Table>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.label} className={c.className}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <EmptyRow colSpan={columns.length}>{empty}</EmptyRow>
        ) : (
          rows.map((r) => (
            <tr key={r.id}>
              {columns.map((c, i) => (
                <td key={c.label} className={c.className}>
                  {i === 0 ? (
                    <span className="flex flex-wrap items-center gap-2">
                      <Link href={`${basePath}/${r.id}`} className="font-medium text-fg hover:text-accent-ink hover:underline">
                        {c.render(r)}
                      </Link>
                      {r.is_example && <ExamplePill />}
                    </span>
                  ) : (
                    c.render(r)
                  )}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
}

/** Bouton de bascule rapide (publié / mis en avant) dans une liste. */
export function ToggleForm({ entity, id, field, value, children, label }: { entity: string; id: string; field: string; value: string; children: ReactNode; label: string }) {
  return (
    <form action={toggleField}>
      <input type="hidden" name="_entity" value={entity} />
      <input type="hidden" name="_id" value={id} />
      <input type="hidden" name="_field" value={field} />
      <input type="hidden" name="_value" value={value} />
      <button type="submit" title={label} aria-label={label} className="rounded-xs hover:opacity-80">
        {children}
      </button>
    </form>
  );
}
