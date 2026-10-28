exports.handler = async () => {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.SESSION_SECRET) return { statusCode: 503, headers: { 'Content-Type': 'text/html' }, body: '<h1>Editor sign-in is not configured</h1><p>Set GITHUB_CLIENT_ID and SESSION_SECRET in Netlify environment variables.</p>' };
  const redirect = `${process.env.URL || ''}/.netlify/functions/auth-callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(process.env.GITHUB_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirect)}&scope=read:user`;
  return { statusCode: 302, headers: { Location: url }, body: '' };
};
