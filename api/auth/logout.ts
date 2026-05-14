import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Set-Cookie', [
    'ig_access_token=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0',
    'ig_user=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0'
  ]);
  return res.status(200).json({ success: true });
}
