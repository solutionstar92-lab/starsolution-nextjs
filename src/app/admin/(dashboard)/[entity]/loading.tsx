/**
 * Shown while a dashboard page waits on Supabase.
 *
 * Every admin route is force-dynamic, so navigation blocks on a query before
 * anything paints. This gives the shell something to show immediately, which
 * is most of the difference between "slow" and "loading".
 */
export default function DashboardLoading() {
  return (
    <>
      <header className="admin-head">
        <div className="admin-subhead">
          <div style={{ width: '100%' }}>
            <span className="admin-skeleton" style={{ width: 180, height: 26 }} />
            <span className="admin-skeleton" style={{ width: 260, height: 14, marginTop: 9 }} />
          </div>
        </div>
      </header>
      <div className="admin-body">
        <div className="admin-card">
          {[0, 1, 2, 3, 4].map((i) => (
            <div className="admin-skeleton-row" key={i}>
              <span className="admin-skeleton" style={{ width: `${58 - i * 6}%`, height: 15 }} />
              <span className="admin-skeleton" style={{ width: 64, height: 15 }} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
