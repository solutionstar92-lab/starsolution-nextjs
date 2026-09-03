import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · StarSolution admin' },
  robots: { index: false, follow: false },
};

/**
 * Wraps everything under /admin, including the login page, which is why the
 * stylesheet is imported here rather than in the (dashboard) group.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
