import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const igToken = req.cookies.ig_access_token;
  return res.status(200).json({ loggedIn: !!igToken });
}
