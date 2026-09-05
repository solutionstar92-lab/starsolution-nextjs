import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { rscSupabase } from '@/lib/admin/session';
import { AdminHeader } from '../AdminHeader';
import { LEAD_STATUSES, STATUS_LABEL, type LeadStatus } from './leads/constants';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

interface RecentLead {
  id: string;
  name: string;
  email: string;
  status: LeadStatus;
  created_at: string;
}

const when = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default async function DashboardPage() {
  const supabase = rscSupabase();

  // head:true asks Postgres for the count only — no rows cross the wire.
  const [{ count: total }, { data: statusRows }, { data: recentRows }] = await Promise.all([
    supabase.from('leads').select('id', { count: 'exact', head: true }),
    supabase.from('leads').select('status'),
    supabase.from('leads').select('id, name, email, status, created_at')
      .order('created_at', { ascending: false }).limit(5),
  ]);

  const counts = new Map<LeadStatus, number>(LEAD_STATUSES.map((s) => [s, 0]));
  for (const row of (statusRows ?? []) as { status: LeadStatus }[]) {
    counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
  }
  const recent = (recentRows ?? []) as RecentLead[];

  return (
    <>
      <AdminHeader
        title="Dashboard"
        subtitle={`${total ?? 0} lead${total === 1 ? '' : 's'} in total.`}
        action={<Link href="/admin/leads" className="btn btn-ghost btn-sm">All leads <Icon name="arrow" className="h-4 w-4" /></Link>}
      />

      <div className="admin-body">
        <div className="admin-stat-row">
          <div className="admin-stat">
            <p className="admin-stat-num">{total ?? 0}</p>
            <p className="admin-stat-label">Total</p>
          </div>
          {LEAD_STATUSES.map((status) => (
            <div className="admin-stat" key={status}>
              <p className="admin-stat-num">{counts.get(status) ?? 0}</p>
              <p className="admin-stat-label">{STATUS_LABEL[status]}</p>
            </div>
          ))}
        </div>

        <div className="admin-card">
          <div className="admin-card-head">
            <h2>Latest enquiries</h2>
            <Link href="/admin/leads" className="admin-link">View all</Link>
          </div>

          {recent.length === 0 ? (
            <p className="admin-empty">
              No leads yet. Submissions from the contact form land here.
            </p>
          ) : (
            <ul className="admin-list">
              {recent.map((lead) => (
                <li key={lead.id}>
                  {/* All three inside the link: .admin-list a is the flex row,
                      so siblings outside it fell to a second line. This also
                      makes the whole row the target instead of just the name. */}
                  <Link href={`/admin/leads/${lead.id}`}>
                    <span className="admin-list-main">
                      <strong>{lead.name}</strong>
                      <span className="admin-muted">{lead.email}</span>
                    </span>
                    <span className={`admin-status is-${lead.status}`}>{STATUS_LABEL[lead.status]}</span>
                    <span className="admin-muted admin-list-date">{when(lead.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
