import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { rscSupabase } from '@/lib/admin/session';
import { entityByKey } from '@/lib/admin/entities';
import { AdminHeader } from '../../../AdminHeader';
import { EntityForm } from '../EntityForm';
import { DeleteRow, VisibilityToggle } from '../RowActions';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { params: { entity: string; id: string } },
): Promise<Metadata> {
  const entity = entityByKey(params.entity);
  return { title: entity ? `Edit ${entity.singular}` : 'Edit' };
}

export default async function EditEntityPage({
  params,
}: {
  params: { entity: string; id: string };
}) {
  const entity = entityByKey(params.entity);
  if (!entity) notFound();

  const id = decodeURIComponent(params.id);
  const supabase = rscSupabase();
  const { data } = await supabase.from(entity.table).select('*').eq('id', id).maybeSingle();
  if (!data) notFound();

  const hideable = entity.hideable !== false;
  const row = data as Record<string, unknown>;
  const title = String(row[entity.titleField] ?? id);
  const slug = entity.slugField ? String(row.slug ?? '') : null;

  /* The public address of this row, so the editor can check their work. */
  const publicPath = entity.revalidate.find((p) => p.includes(':slug'));
  const livePath = publicPath && slug ? publicPath.replace(':slug', slug) : null;

  return (
    <>
      <AdminHeader
        title={title}
        subtitle={`${entity.table} · ${id}`}
        action={
          <Link href={`/admin/${entity.key}`} className="btn btn-ghost btn-sm">
            <Icon name="left" className="h-4 w-4" /> All {entity.label.toLowerCase()}
          </Link>
        }
      />

      <div className="admin-body">
        {entity.notice && <p className="admin-alert is-warn">{entity.notice}</p>}

        <div className="admin-detail">
          <div className="admin-detail-main">
            <div className="admin-card">
              <EntityForm entity={entity} row={row} mode="edit" />
            </div>
          </div>

          <aside className="admin-detail-side">
            {hideable && (
            <div className="admin-card">
              <div className="admin-card-head"><h2>Visibility</h2></div>
              <VisibilityToggle
                entityKey={entity.key}
                id={id}
                slug={slug}
                hidden={Boolean(row.hidden)}
              />
              <p className="admin-help">
                Hiding removes it from every listing and its detail page 404s.
                The row stays in the database.
              </p>

              {livePath && !row.hidden && (
                <p style={{ marginTop: 12 }}>
                  <a
                    href={livePath}
                    className="admin-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on the site <Icon name="link" className="h-4 w-4" />
                  </a>
                </p>
              )}
            </div>
            )}

            <div className="admin-card admin-card-danger">
              <div className="admin-card-head"><h2>Delete</h2></div>
              <p className="admin-help">
                Removes the row permanently. If you only want it off the site,
                hide it instead.
              </p>
              <div style={{ marginTop: 10 }}>
                <DeleteRow
                  entityKey={entity.key}
                  id={id}
                  slug={slug}
                  name={title}
                  label={`Delete ${entity.singular}`}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
