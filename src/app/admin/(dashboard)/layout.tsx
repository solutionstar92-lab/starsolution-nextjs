import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '../Sidebar';

/* Always current: the dashboard reads the database on every request. */
export const dynamic = 'force-dynamic';

/**
 * Chrome for the signed-in dashboard.
 *
 * Middleware has already rejected anonymous and non-admin visitors, but this
 * checks again — middleware runs at the edge and is a routing concern, not a
 * security boundary. RLS on the tables is the third and final gate.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: admin } = await supabase
    .from('admins')
    .select('user_id, full_name')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!admin) redirect('/admin/login?denied=1');

  return (
    <div className="admin-shell">
      <Sidebar email={user.email ?? ''} fullName={admin.full_name} />
      <div className="admin-main">
        <div className="admin-canvas">{children}</div>
      </div>
    </div>
  );
}
