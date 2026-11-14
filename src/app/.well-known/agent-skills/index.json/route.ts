import { SKILL_MD } from '@/lib/agent/docs';
import { URLS, json, sha256 } from '@/lib/agent/catalog';

/** Agent Skills discovery index. The digest is computed from the served bytes. */
export const dynamic = 'force-static';

export const GET = () =>
  json({
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills: [
      {
        name: 'starsolution',
        type: 'skill-md',
        description:
          'Find out what StarSolution.ai offers, read its case studies and blog, and request a callback from the team.',
        url: URLS.skill,
        digest: `sha256:${sha256(SKILL_MD)}`,
      },
    ],
  });
