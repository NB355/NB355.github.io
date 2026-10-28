const { sessionCookie, allowedLogin } = require('./_shared');
exports.handler = async event => {
  const code = event.queryStringParameters?.code;
  if (!code || !process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET || !process.env.SESSION_SECRET) return { statusCode: 503, body: 'GitHub OAuth is not configured.' };
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code }) });
  const token = await tokenResponse.json();
  if (!token.access_token) return { statusCode: 502, body: 'GitHub sign-in could not be completed.' };
  const userResponse = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${token.access_token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'nb355-portfolio-editor' } });
  const user = await userResponse.json();
  if (user.login !== allowedLogin) return { statusCode: 403, body: 'This editor is restricted to the configured GitHub account.' };
  return { statusCode: 302, headers: { Location: '/editor/', 'Set-Cookie': sessionCookie(user.login) }, body: '' };
};
