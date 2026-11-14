import { AGENT_DESCRIPTION, AGENT_VERSION, URLS, json } from '@/lib/agent/catalog';
import { SITE_URL } from '@/lib/schema';

export const dynamic = 'force-static';

const list = (ref: string) => ({
  description: 'OK',
  content: {
    'application/json': {
      schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: ref } } } },
    },
  },
});

const spec = {
  openapi: '3.1.0',
  info: {
    title: 'StarSolution.ai Public API',
    version: AGENT_VERSION,
    description: AGENT_DESCRIPTION,
    contact: { email: 'info@starsolution.ai', url: `${SITE_URL}/contact` },
  },
  externalDocs: { url: URLS.developers },
  servers: [{ url: URLS.api }],
  paths: {
    '/services': {
      get: {
        operationId: 'listServices',
        summary: 'List services',
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['solution', 'automation', 'system'] } },
        ],
        responses: { 200: list('#/components/schemas/Service') },
      },
    },
    '/case-studies': {
      get: {
        operationId: 'listCaseStudies',
        summary: 'List case studies',
        responses: { 200: list('#/components/schemas/CaseStudy') },
      },
    },
    '/posts': {
      get: {
        operationId: 'listPosts',
        summary: 'List or search blog posts',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50 } },
        ],
        responses: { 200: list('#/components/schemas/Post') },
      },
    },
    '/health': {
      get: {
        operationId: 'health',
        summary: 'Health check',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/leads': {
      get: {
        operationId: 'listLeads',
        summary: 'Lead inbox (staff only)',
        security: [{ oauth: [] }],
        responses: { 200: { description: 'OK' }, 401: { description: 'Missing or invalid token' } },
      },
    },
  },
  components: {
    securitySchemes: {
      oauth: {
        type: 'openIdConnect',
        openIdConnectUrl: `${SITE_URL}/.well-known/openid-configuration`,
        description: `See ${URLS.authMd}`,
      },
    },
    schemas: {
      Service: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['solution', 'automation', 'system'] },
          slug: { type: 'string' },
          title: { type: 'string' },
          summary: { type: 'string' },
          highlights: { type: 'array', items: { type: 'string' } },
          stats: {
            type: 'array',
            items: { type: 'object', properties: { label: { type: 'string' }, value: { type: 'string' } } },
          },
          url: { type: 'string', format: 'uri' },
        },
      },
      CaseStudy: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          title: { type: 'string' },
          type: { type: ['string', 'null'] },
          summary: { type: 'string' },
          result: { type: 'string' },
          before: { type: ['string', 'null'] },
          after: { type: ['string', 'null'] },
          period: { type: ['string', 'null'] },
          url: { type: 'string', format: 'uri' },
        },
      },
      Post: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          title: { type: 'string' },
          excerpt: { type: 'string' },
          date: { type: 'string' },
          tag: { type: 'string' },
          url: { type: 'string', format: 'uri' },
        },
      },
    },
  },
};

export const GET = () => json(spec, { contentType: 'application/vnd.oai.openapi+json' });
