import { DEVELOPERS_MD } from '@/lib/agent/docs';
import { text } from '@/lib/agent/catalog';

export const dynamic = 'force-static';
export const GET = () => text(DEVELOPERS_MD, 'text/markdown');
