import { SKILL_MD } from '@/lib/agent/docs';
import { text } from '@/lib/agent/catalog';

export const dynamic = 'force-static';
export const GET = () => text(SKILL_MD, 'text/markdown');
