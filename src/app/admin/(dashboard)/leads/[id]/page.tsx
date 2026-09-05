import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { rscSupabase } from '@/lib/admin/session';
import { Icon } from '@/components/Icon';
import { AdminHeader } from '../../../AdminHeader';
import { StatusPicker } from '../StatusPicker';
import { NoteComposer } from '../NoteComposer';
import { ReplyActions } from '../ReplyActions';
import { deleteLead } from '../actions';
import { ConfirmDelete } from '../../../ConfirmDelete';
import { STATUS_LABEL, type LeadStatus } from '../constants';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = rscSupabase();
  const { data } = await supabase.from('leads').select('name').eq('id', params.id).maybeSingle();
  return { title: data?.name ?? 'Lead' };
}

interface Note {
  id: string;
  body: string;
  created_at: string;
  author_id: string | null;
}

function formatWhen(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const supabase = rscSupabase();

  const { data: lead } = await supabase
    .from('leads')
    .select('id, name, email, phone, company, message, status, created_at')
    .eq('id', params.id)
    .maybeSingle();

  if (!lead) notFound();

  const { data: noteRows } = await supabase
    .from('lead_notes')
    .select('id, body, created_at, author_id')
    .eq('lead_id', params.id)
    .order('created_at', { ascending: false });

  const notes = (noteRows ?? []) as Note[];

  return (
    <>
      <AdminHeader
        title={lead.name}
        subtitle={`Received ${formatWhen(lead.created_at)}`}
        action={
          <Link href="/admin/leads" className="btn btn-ghost btn-sm">
            <Icon name="left" className="h-4 w-4" /> All leads
          </Link>
        }
      />

      <div className="admin-body">
        <div className="admin-detail">
          <div className="admin-detail-main">
            <section className="admin-card">
              <header className="admin-card-head"><h2>Submission</h2></header>

              <dl className="admin-facts">
                <div>
                  <dt>Email</dt>
                  <dd>
                    {lead.email
                      ? <a href={`mailto:${lead.email}`}>{lead.email}</a>
                      : <span className="admin-muted">Not given — callback request</span>}
                  </dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>
                    {lead.phone
                      ? <a href={`tel:${lead.phone.replace(/\s/g, '')}`}>{lead.phone}</a>
                      : <span className="admin-muted">Not given</span>}
                  </dd>
                </div>
                <div>
                  <dt>Business</dt>
                  <dd>{lead.company ?? <span className="admin-muted">Not given</span>}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd><span className={`admin-status is-${lead.status}`}>{STATUS_LABEL[lead.status as LeadStatus]}</span></dd>
                </div>
              </dl>

              {lead.message && (
                <>
                  <h3 className="admin-subhead">Message</h3>
                  <p className="admin-quote">{lead.message}</p>
                </>
              )}
            </section>

            <section className="admin-card">
              <header className="admin-card-head">
                <h2>Notes</h2>
                <span className="admin-count">{notes.length}</span>
              </header>

              <NoteComposer leadId={lead.id} />

              {notes.length === 0 ? (
                <p className="admin-empty-inline">No notes yet.</p>
              ) : (
                <ol className="admin-notes">
                  {notes.map((note) => (
                    <li key={note.id}>
                      <div className="admin-note-meta">
                        <time dateTime={note.created_at}>{formatWhen(note.created_at)}</time>
                      </div>
                      <p>{note.body}</p>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          <aside className="admin-detail-side">
            <section className="admin-card">
              <header className="admin-card-head"><h2>Manage</h2></header>
              <StatusPicker id={lead.id} status={lead.status as LeadStatus} />

              <ReplyActions
                email={lead.email}
                name={lead.name}
                phone={lead.phone}
              />
            </section>

            <section className="admin-card admin-card-danger">
              <header className="admin-card-head"><h2>Delete</h2></header>
              <p className="admin-note-hint">
                Removes the lead and its notes permanently. This cannot be undone.
              </p>
              {/* Was a single unguarded click, while deleting a testimonial
                  asked you to type the word. That was the wrong way round: a
                  testimonial can be retyped, an enquiry cannot. */}
              <ConfirmDelete
                action={deleteLead}
                name={lead.name || lead.email}
                label="Delete lead"
              >
                <input type="hidden" name="id" value={lead.id} />
              </ConfirmDelete>
            </section>
          </aside>
        </div>
      </div>
    </>
  );
}
