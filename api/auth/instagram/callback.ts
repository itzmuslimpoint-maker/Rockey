import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Legacy fallback. The real callback is the SPA route /auth/instagram/callback
 * (handled by src/pages/auth/instagram/callback.tsx). If anything ever hits
 * this serverless path directly (e.g. a stale Meta App config that points
 * here), we just bounce them to the SPA route preserving the query string.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const qs = req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  res.redirect(302, `/auth/instagram/callback${qs}`);
}
