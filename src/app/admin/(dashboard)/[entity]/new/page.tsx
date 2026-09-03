import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { entityByKey } from '@/lib/admin/entities';
import { AdminHeader } from '../../../AdminHeader';
import { EntityForm } from '../EntityForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { params: { entity: string } },
): Promise<Metadata> {
  const entity = entityByKey(params.entity);
  return { title: entity ? `New ${entity.singular}` : 'New' };
}

export default function NewEntityPage({ params }: { params: { entity: string } }) {
  const entity = entityByKey(params.entity);
  if (!entity) notFound();

  return (
    <>
      <AdminHeader
        title={`New ${entity.singular}`}
        subtitle={`Adds a row to ${entity.table}.`}
        action={
          <Link href={`/admin/${entity.key}`} className="btn btn-ghost btn-sm">
            <Icon name="left" className="h-4 w-4" /> All {entity.label.toLowerCase()}
          </Link>
        }
      />
      <div className="admin-body">
        {entity.notice && <p className="admin-alert is-warn">{entity.notice}</p>}
        <div className="admin-card">
          <EntityForm entity={entity} row={null} mode="create" />
        </div>
      </div>
    </>
  );
}
