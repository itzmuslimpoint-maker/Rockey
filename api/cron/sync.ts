import type { VercelRequest, VercelResponse } from '@vercel/node';
import { syncAllUsers } from '../_lib/instagram-sync';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Optional: Verify cron secret if configured
  // const authHeader = req.headers.authorization;
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  try {
    await syncAllUsers();
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
