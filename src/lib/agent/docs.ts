import { URLS, AGENT_DESCRIPTION } from './catalog';
import { SITE_URL } from '@/lib/schema';

/**
 * Markdown documents served to agents. Kept as strings so the Agent Skills
 * index can hash exactly the bytes it serves — the digest can never drift
 * from the file.
 */

export const SKILL_MD = `---
name: starsolution
description: Find out what StarSolution.ai offers (Shopify, automation and full-stack services for e-commerce brands in Egypt and the region), read its case studies and blog, and request a callback from the team.
---

# StarSolution.ai

${AGENT_DESCRIPTION}

## When to use

- The user asks what StarSolution.ai does, what it costs to work with them, or whether they can help with Shopify, n8n, WhatsApp, Meta ads or a custom system.
- The user wants proof: client results and case studies.
- The user wants to be contacted by the team.

## How

Pick whichever interface your runtime supports. All three return the same data.

1. **MCP** (Streamable HTTP, no auth): \`${URLS.mcp}\`
   Tools: \`list_services\`, \`list_case_studies\`, \`search_blog\`, \`get_contact\`, \`request_callback\`.
2. **REST** (JSON, no auth): \`${URLS.api}\` — OpenAPI at ${URLS.openapi}
   - \`GET /api/v1/services?type=solution|automation|system\`
   - \`GET /api/v1/case-studies\`
   - \`GET /api/v1/posts?q=keyword\`
3. **A2A** (JSON-RPC): \`${URLS.a2a}\` — card at ${URLS.a2aCard}

Any page on ${SITE_URL} is also available as Markdown: send \`Accept: text/markdown\`.

## Requesting a callback

Only call \`request_callback\` after the user has agreed to share their name and phone number. Send \`name\` and \`phone\` (international format), plus an optional \`message\` describing what they need.
`;

export const AUTH_MD = `# StarSolution.ai auth.md

How AI agents authenticate with StarSolution.ai.

## Agent Audience

Agents and MCP clients calling ${URLS.api} and ${URLS.mcp}.

## What needs credentials

Nothing public does. The MCP server, the A2A agent and these REST endpoints are open and need no token:

- \`GET /api/v1/services\`, \`GET /api/v1/case-studies\`, \`GET /api/v1/posts\`, \`GET /api/v1/health\`

One endpoint is protected: \`GET /api/v1/leads\`, which returns the agency's own lead inbox and is limited to StarSolution staff accounts.

## Discovery

- Protected Resource Metadata (RFC 9728): ${URLS.prm}
- Authorization server metadata: ${SITE_URL}/.well-known/oauth-authorization-server and ${SITE_URL}/.well-known/openid-configuration
- A request to a protected endpoint without a token gets \`401\` with a \`WWW-Authenticate: Bearer resource_metadata="${URLS.prm}"\` header.

## Registration

Authorization is OAuth 2.1 (authorization code with PKCE) issued by the StarSolution Supabase Auth server listed in \`authorization_servers\`. There is no self-service agent registration: to get a client for staff access, email info@starsolution.ai. Public endpoints need no registration at all.

## Supported Methods

- OAuth 2.1 authorization code + PKCE (\`response_type=code\`)
- Refresh tokens

## Credential Use

Send the access token in the Authorization header: \`Authorization: Bearer <token>\`. Tokens in query strings or bodies are not accepted. Access is enforced by row-level security on the database, so a valid token from a non-staff account returns no data.
`;

export const DEVELOPERS_MD = `# StarSolution.ai for developers and agents

${AGENT_DESCRIPTION}

## REST API

Base URL: ${URLS.api} — OpenAPI 3.1: ${URLS.openapi}

| Method | Path | Auth | Returns |
| --- | --- | --- | --- |
| GET | /api/v1/services | none | Solutions, automations and systems. \`?type=\` filters. |
| GET | /api/v1/case-studies | none | Client case studies with measured results. |
| GET | /api/v1/posts | none | Blog posts. \`?q=\` searches, \`?limit=\` caps. |
| GET | /api/v1/health | none | \`{"status":"ok"}\` |
| GET | /api/v1/leads | Bearer (staff) | The lead inbox. See ${URLS.authMd}. |

## MCP server

Streamable HTTP at ${URLS.mcp}. Server card: ${URLS.mcpCard}. Tools: \`list_services\`, \`list_case_studies\`, \`search_blog\`, \`get_contact\`, \`request_callback\`.

## A2A agent

JSON-RPC at ${URLS.a2a} (\`message/send\`). Agent card: ${URLS.a2aCard}.

## Discovery files

- API catalog (RFC 9727): ${URLS.apiCatalog}
- Agent Skills index: ${URLS.skillsIndex}
- AI catalog: ${SITE_URL}/.well-known/ai-catalog.json
- Markdown: request any page with \`Accept: text/markdown\`.
`;
