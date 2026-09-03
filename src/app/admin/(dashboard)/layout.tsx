import { redirect } from 'next/navigation';
import { getAdminContext } from '@/lib/admin/session';
import { Sidebar } from '../Sidebar';

/* Always current: the dashboard reads the database on every request. */
export const dynamic = 'force-dynamic';

/**
 * Chrome for the signed-in dashboard.
 *
 * Middleware has already turned anonymous visitors away, but this checks again
 * — middleware runs at the edge and is a routing concern, not a security
 * boundary. RLS on the tables is the third and final gate.
 *
 * The lookup is cached per request, so the page rendered inside this layout
 * can call getAdminContext() again without a second round trip.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { email, fullName, isAdmin, userId, lookupError } = await getAdminContext();

  // No session at all: genuinely signed out.
  if (!userId) redirect('/admin/login');

  /* A failed membership query is not proof of anything. Bouncing to the login
     page on a dropped connection is what makes the session feel unreliable —
     the user was signed in the whole time. Say so and let them retry. */
  if (lookupError) {
    return (
      <div className="admin-shell">
        <div className="admin-main">
          <div className="admin-canvas">
            <div className="admin-body">
              <p className="admin-alert is-error">
                Could not check your admin access: {lookupError}. You are still signed
                in — reload the page to try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) redirect('/admin/login?denied=1');

  return (
    <div className="admin-shell">
      <Sidebar email={email} fullName={fullName} />
      <div className="admin-main">
        <div className="admin-canvas">{children}</div>
      </div>
    </div>
  );
}
