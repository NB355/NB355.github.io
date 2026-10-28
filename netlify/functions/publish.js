const { readSession, response, validateContent } = require('./_shared');
exports.handler = async event => {
  if (event.httpMethod !== 'POST') return response(405, { error: 'POST required.' });
  if (!readSession(event)) return response(401, { error: 'Sign in with the authorized GitHub account before publishing.' });
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) return response(503, { error: 'Publishing is unavailable. Configure GITHUB_TOKEN and GITHUB_REPO in Netlify.' });
  try {
    const content = validateContent(JSON.parse(event.body || '{}'));
    const [owner, repo] = process.env.GITHUB_REPO.split('/'); const path = process.env.GITHUB_CONTENT_PATH || 'content/content.json'; const branch = process.env.GITHUB_BRANCH || 'main';
    const headers = { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'User-Agent': 'nb355-portfolio-editor' };
    const endpoint = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const existingResponse = await fetch(`${endpoint}?ref=${encodeURIComponent(branch)}`, { headers }); const existing = await existingResponse.json();
    const body = { message: 'Update portfolio content from Editor Portal', content: Buffer.from(`${JSON.stringify(content, null, 2)}\n`).toString('base64'), branch, sha: existing.sha };
    const commitResponse = await fetch(endpoint, { method: 'PUT', headers, body: JSON.stringify(body) }); const commit = await commitResponse.json();
    if (!commitResponse.ok) return response(commitResponse.status, { error: commit.message || 'GitHub rejected the commit.' });
    return response(200, { ok: true, commit: commit.commit?.html_url || commit.commit?.sha });
  } catch (error) { return response(400, { error: error.message }); }
};
