/**
 * OSINT Engagement Log — Cloudflare Worker proxy
 *
 * Environment variables to set in the Cloudflare dashboard:
 *   GITHUB_TOKEN  — fine-grained PAT with Actions: Read and write on the public repo
 *   GH_OWNER      — e.g. nfernoedge
 *   GH_REPO       — e.g. osint-engagement
 *   GH_BRANCH     — e.g. main
 *   SUBMIT_KEY    — shared passphrase given to authorised operators
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {

    // Pre-flight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (request.method !== 'POST') {
      return respond(405, { error: 'Method not allowed' });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return respond(400, { error: 'Invalid JSON body' });
    }

    // Validate submit key first (before anything else)
    if (!env.SUBMIT_KEY || body.submitKey !== env.SUBMIT_KEY) {
      return respond(401, { error: 'Invalid or missing submit key' });
    }

    // Ping — auth check only, no dispatch needed
    if (body.ping === true) {
      return respond(200, { ok: true, ping: true });
    }

    if (!body.payload || typeof body.payload !== 'object') {
      return respond(400, { error: 'Missing payload' });
    }

    // Forward to GitHub workflow_dispatch
    const ghRes = await fetch(
      `https://api.github.com/repos/${env.GH_OWNER}/${env.GH_REPO}/actions/workflows/log-engagement.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization:  `Bearer ${env.GITHUB_TOKEN}`,
          Accept:         'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent':   'osint-engagement-worker',
        },
        body: JSON.stringify({
          ref:    env.GH_BRANCH || 'main',
          inputs: { payload: JSON.stringify(body.payload) },
        }),
      }
    );

    if (ghRes.status === 204) {
      return respond(200, { ok: true });
    }

    const err = await ghRes.json().catch(() => ({}));
    return respond(ghRes.status, { ok: false, error: err.message || 'GitHub API error' });
  },
};

function respond(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
