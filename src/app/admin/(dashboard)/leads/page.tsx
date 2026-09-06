import type { Metadata } from 'next';
import Link from 'next/link';
import { rscSupabase } from '@/lib/admin/session';
import { Icon } from '@/components/Icon';
import { AdminHeader } from '../../AdminHeader';
import { LEAD_STATUSES, STATUS_LABEL, type LeadStatus } from './constants';

export const metadata: Metadata = { title: 'Leads' };
export const dynamic = 'force-dynamic';

interface LeadRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  message: string | null;
  status: LeadStatus;
  created_at: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const supabase = rscSupabase();
  const activeStatus = LEAD_STATUSES.includes(searchParams.status as LeadStatus)
    ? (searchParams.status as LeadStatus)
    : null;
  const query = (searchParams.q ?? '').trim();

  let request = supabase
    .from('leads')
    .select('id, name, email, phone, company, message, status, created_at')
    .order('created_at', { ascending: false });

  if (activeStatus) request = request.eq('status', activeStatus);
  if (query) {
    // escape commas so a search term cannot break out of the or() filter
    const safe = query.replace(/[,()]/g, ' ');
    // message included: it is where "Shopify, 400 orders a month" actually
    // lives, and searching every field the form collects is what someone
    // typing into this box expects.
    // phone included since the audit form began requiring one: it is the field
    // someone has in front of them after a missed call, and it was the only
    // thing on the row that could not be searched for.
    //
    // Matched as stored, so a partial number works — "1234" finds
    // "+20 101 234 5678" — but the spacing has to match the way it was typed
    // in. Normalising that properly means a generated digits-only column and a
    // migration to go with it, which is not worth it until someone is actually
    // searching enough numbers to be annoyed.
    request = request.or(
      `name.ilike.%${safe}%,email.ilike.%${safe}%,company.ilike.%${safe}%,message.ilike.%${safe}%,phone.ilike.%${safe}%`,
    );
  }

  const { data, error } = await request;
  const leads = (data ?? []) as LeadRow[];

  // counts for the filter chips, unaffected by the current filter
  const { data: allStatuses } = await supabase.from('leads').select('status');
  const counts = (allStatuses ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});
  const total = (allStatuses ?? []).length;

  const chipHref = (status: string | null) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (query) params.set('q', query);
    const qs = params.toString();
    return `/admin/leads${qs ? `?${qs}` : ''}`;
  };

  return (
    <>
      <AdminHeader
        title="Leads"
        subtitle={`${total} submission${total === 1 ? '' : 's'} from the contact form.`}
      />

      <div className="admin-body">
        <div className="admin-toolbar">
          <nav className="admin-chips" aria-label="Filter by status">
            <Link href={chipHref(null)} className={`admin-chip${!activeStatus ? ' is-on' : ''}`}>
              All <span>{total}</span>
            </Link>
            {LEAD_STATUSES.map((status) => (
              <Link
                key={status}
                href={chipHref(status)}
                className={`admin-chip${activeStatus === status ? ' is-on' : ''}`}
              >
                {STATUS_LABEL[status]} <span>{counts[status] ?? 0}</span>
              </Link>
            ))}
          </nav>

          <form className="admin-search" action="/admin/leads" method="get">
            {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
            <Icon name="search" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search name, email, phone, company or message"
              aria-label="Search leads"
            />
          </form>
        </div>

        {error && (
          <p className="admin-alert is-error">
            Could not load leads. Check that <code>supabase/admin.sql</code> has been run.
          </p>
        )}

        {leads.length === 0 ? (
          <p className="admin-empty-inline">
            {query || activeStatus
              ? 'No leads match that filter.'
              : 'No leads yet. Submissions from the contact form land here.'}
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Business</th>
                  <th scope="col">Received</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <th scope="row">
                      <Link href={`/admin/leads/${lead.id}`}>{lead.name}</Link>
                    </th>
                    <td>
                      {lead.email
                        ? <a href={`mailto:${lead.email}`}>{lead.email}</a>
                        : <span className="admin-muted">{lead.phone || '—'}</span>}
                      {lead.phone && <span className="admin-sub">{lead.phone}</span>}
                    </td>
                    <td>{lead.company ?? <span className="admin-muted">—</span>}</td>
                    <td><time dateTime={lead.created_at}>{formatDate(lead.created_at)}</time></td>
                    <td><span className={`admin-status is-${lead.status}`}>{STATUS_LABEL[lead.status]}</span></td>
                    <td className="admin-table-end">
                      <Link href={`/admin/leads/${lead.id}`} className="admin-link">
                        Open <Icon name="arrow" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
