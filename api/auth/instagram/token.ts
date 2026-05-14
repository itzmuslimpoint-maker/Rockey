import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.cookies.ig_access_token;
  if (!token) {
    return res.status(404).json({ error: "No token found" });
  }
  res.json({ token });
}
