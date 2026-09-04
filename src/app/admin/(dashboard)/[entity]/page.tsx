import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { rscSupabase } from '@/lib/admin/session';
import { ENTITIES, entityByKey } from '@/lib/admin/entities';
import { AdminHeader } from '../../AdminHeader';
import { VisibilityToggle } from './RowActions';

export const dynamic = 'force-dynamic';

/** Only the eight declared content types resolve; anything else is a 404. */
export function generateStaticParams() {
  return ENTITIES.map((e) => ({ entity: e.key }));
}

export async function generateMetadata(
  { params }: { params: { entity: string } },
): Promise<Metadata> {
  return { title: entityByKey(params.entity)?.label ?? 'Content' };
}

export default async function EntityListPage({
  params, searchParams,
}: {
  params: { entity: string };
  searchParams: { created?: string; deleted?: string };
}) {
  const entity = entityByKey(params.entity);
  if (!entity) notFound();

  const hideable = entity.hideable !== false;

  const supabase = rscSupabase();
  const { data, error } = await supabase
    .from(entity.table)
    .select('*')
    // Not every table has sort_order; ordering by a column that does not
    // exist fails the whole query with 42703.
    .order(entity.orderBy ?? 'sort_order', { ascending: true });

  const rows = (data ?? []) as Record<string, unknown>[];
  const live = rows.filter((r) => !r.hidden).length;

  return (
    <>
      <AdminHeader
        title={entity.label}
        subtitle={
          error
            ? 'Could not load this table.'
            : hideable
              ? `${rows.length} row${rows.length === 1 ? '' : 's'}, ${live} live on the site.`
              : `${rows.length} row${rows.length === 1 ? '' : 's'}.`
        }
        action={
          <Link href={`/admin/${entity.key}/new`} className="btn btn-primary btn-sm">
            <Icon name="check" className="h-4 w-4" /> New {entity.singular}
          </Link>
        }
      />

      <div className="admin-body">
        {entity.notice && <p className="admin-alert is-warn">{entity.notice}</p>}
        {searchParams.created && <p className="admin-alert is-ok">Created {searchParams.created}.</p>}
        {searchParams.deleted && <p className="admin-alert is-ok">Deleted.</p>}

        {error && (
          <p className="admin-alert is-error">
            {error.message}. If this mentions a missing table or column, run
            {' '}<code>supabase/schema.sql</code> and <code>supabase/admin.sql</code>.
          </p>
        )}

        {!error && rows.length === 0 && (
          <p className="admin-empty">
            Nothing here yet. Create the first {entity.singular}.
          </p>
        )}

        {rows.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{entity.titleField === 'name' ? 'Name' : 'Title'}</th>
                  {entity.slugField && <th>Slug</th>}
                  {hideable && <th>Order</th>}
                  {hideable && <th>Visibility</th>}
                  <th className="admin-table-end">Edit</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const id = String(row.id);
                  const title = String(row[entity.titleField] ?? id);
                  const subtitle = entity.subtitleField ? row[entity.subtitleField] : null;
                  return (
                    <tr key={id}>
                      <td>
                        <Link href={`/admin/${entity.key}/${encodeURIComponent(id)}`}>
                          <strong>{title}</strong>
                        </Link>
                        {subtitle ? <span className="admin-muted">{String(subtitle)}</span> : null}
                      </td>
                      {entity.slugField && (
                        <td className="admin-muted">{String(row.slug ?? '—')}</td>
                      )}
                      {hideable && (
                        <td className="admin-muted">{String(row.sort_order ?? 0)}</td>
                      )}
                      {hideable && (
                        <td>
                          <VisibilityToggle
                            entityKey={entity.key}
                            id={id}
                            slug={entity.slugField ? String(row.slug ?? '') : null}
                            hidden={Boolean(row.hidden)}
                          />
                        </td>
                      )}
                      <td className="admin-table-end">
                        <Link href={`/admin/${entity.key}/${encodeURIComponent(id)}`} className="admin-link">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
