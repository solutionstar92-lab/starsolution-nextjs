import { AUTH_MD } from '@/lib/agent/docs';
import { text } from '@/lib/agent/catalog';

export const dynamic = 'force-static';
export const GET = () => text(AUTH_MD, 'text/markdown');
